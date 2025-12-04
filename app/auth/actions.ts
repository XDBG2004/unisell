'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  if (!email.endsWith('@student.usm.my') && !email.endsWith('@usm.my')) {
    return { error: 'Only USM emails are allowed (@student.usm.my or @usm.my)' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('User already registered') || error.code === 'user_already_exists') {
      return { error: 'User already exists. Please sign in.' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const fullName = formData.get('fullName') as string
  const campus = formData.get('campus') as string
  const matricNo = formData.get('matricNo') as string
  const file = formData.get('icDocument') as File

  if (!file || file.size === 0) {
    return { error: 'IC/Passport document is required' }
  }

  // Upload file
  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/ic_document.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('private-documents')
    .upload(filePath, file, {
      upsert: true,
    })

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` }
  }

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      campus: campus as any,
      matric_no: matricNo,
      ic_document_path: filePath,
      verification_status: 'pending',
    })

  if (updateError) {
    return { error: `Profile update failed: ${updateError.message}` }
  }

  // Update Auth Session Metadata immediately
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: fullName }
  })
  if (authError) console.error("Auth update failed:", authError)

  revalidatePath('/', 'layout')
  redirect('/')
}
