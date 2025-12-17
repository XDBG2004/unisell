"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveUser(userId: string) {
  const supabase = await createClient()

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('usm_role')
    .eq('id', user.id)
    .single()

  if (profile?.usm_role !== 'admin') {
    return { success: false, error: 'Not authorized' }
  }

  // Update user to verified
  const { error } = await supabase
    .from('profiles')
    .update({
      verification_status: 'verified',
      rejection_reason: null
    })
    .eq('id', userId)

  if (error) {
    console.error('[approveUser] Error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
  
  return { success: true }
}

export async function rejectUser(userId: string, reason: string) {
  console.log('[rejectUser] Starting rejection for userId:', userId)
  console.log('[rejectUser] Rejection reason:', reason)
  
  const supabase = await createClient()

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log('[rejectUser] Not authenticated')
    return { success: false, error: 'Not authenticated' }
  }

  console.log('[rejectUser] Current user:', user.id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('usm_role')
    .eq('id', user.id)
    .single()

  console.log('[rejectUser] Admin profile:', profile)

  if (profile?.usm_role !== 'admin') {
    console.log('[rejectUser] Not authorized - role:', profile?.usm_role)
    return { success: false, error: 'Not authorized' }
  }

  // Validate reason
  if (!reason || reason.trim().length < 10) {
    console.log('[rejectUser] Invalid reason length:', reason?.trim().length)
    return { success: false, error: 'Rejection reason must be at least 10 characters' }
  }

  console.log('[rejectUser] Updating user profile...')
  
  // Update user to rejected with reason
  const { error, data } = await supabase
    .from('profiles')
    .update({
      verification_status: 'rejected',
      rejection_reason: reason.trim()
    })
    .eq('id', userId)
    .select()

  console.log('[rejectUser] Update result:', { error, data })

  if (error) {
    console.error('[rejectUser] Error:', error)
    return { success: false, error: error.message }
  }

  console.log('[rejectUser] Revalidating paths...')
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
  
  console.log('[rejectUser] Success!')
  return { success: true }
}

export async function banUser(userId: string, duration: string, reason: string) {
  console.log('[banUser] Starting ban for userId:', userId, 'duration:', duration)
  
  const supabase = await createClient()

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if trying to ban self
  if (user.id === userId) {
    return { success: false, error: 'You cannot ban yourself' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('usm_role')
    .eq('id', user.id)
    .single()

  if (profile?.usm_role !== 'admin') {
    return { success: false, error: 'Not authorized' }
  }

  // Validate reason
  if (!reason || reason.trim().length < 10) {
    return { success: false, error: 'Ban reason must be at least 10 characters' }
  }

  // Calculate ban expiry date
  const now = new Date()
  let bannedUntil: Date

  switch (duration) {
    case '1day':
      bannedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      break
    case '3days':
      bannedUntil = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      break
    case '1week':
      bannedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      break
    case '1month':
      bannedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      break
    case 'permanent':
      bannedUntil = new Date(now.getTime() + 36500 * 24 * 60 * 60 * 1000) // 100 years
      break
    default:
      return { success: false, error: 'Invalid duration' }
  }

  console.log('[banUser] Ban until:', bannedUntil.toISOString())

  // Update user to banned
  const { error } = await supabase
    .from('profiles')
    .update({
      banned_until: bannedUntil.toISOString(),
      ban_reason: reason.trim()
    })
    .eq('id', userId)

  if (error) {
    console.error('[banUser] Error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
  
  console.log('[banUser] Success!')
  return { success: true }
}

export async function deleteUser(userId: string) {
  console.log('[deleteUser] Starting deletion for userId:', userId)
  
  const supabase = await createClient()

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if trying to delete self
  if (user.id === userId) {
    return { success: false, error: 'You cannot delete yourself' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('usm_role')
    .eq('id', user.id)
    .single()

  if (profile?.usm_role !== 'admin') {
    return { success: false, error: 'Not authorized' }
  }

  // Fetch user data to get file paths
  const { data: targetUser } = await supabase
    .from('profiles')
    .select('ic_document_path')
    .eq('id', userId)
    .single()

  console.log('[deleteUser] Target user IC path:', targetUser?.ic_document_path)

  // Delete IC document if exists
  if (targetUser?.ic_document_path) {
    const { error: icDeleteError } = await supabase.storage
      .from('private-documents')
      .remove([targetUser.ic_document_path])
    
    if (icDeleteError) {
      console.error('[deleteUser] Failed to delete IC:', icDeleteError)
    }
  }

  // List and delete all item images from this user
  const { data: userFolder } = await supabase.storage
    .from('items')
    .list(userId)

  if (userFolder && userFolder.length > 0) {
    const filePaths = userFolder.map(file => `${userId}/${file.name}`)
    console.log('[deleteUser] Deleting item images:', filePaths)
    
    const { error: itemImagesError } = await supabase.storage
      .from('items')
      .remove(filePaths)
    
    if (itemImagesError) {
      console.error('[deleteUser] Failed to delete item images:', itemImagesError)
    }
  }

  // Delete profile (CASCADE will handle related data: items, conversations, messages, reviews, reports, favorites)
  const { error: deleteError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (deleteError) {
    console.error('[deleteUser] Error deleting profile:', deleteError)
    return { success: false, error: deleteError.message }
  }

  revalidatePath('/admin/users')
  
  console.log('[deleteUser] Success!')
  return { success: true }
}
