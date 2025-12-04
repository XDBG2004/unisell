'use server'

import { Item } from "@/types"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createListing(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to sell items." }
  }

  const title = formData.get("title") as string
  const price = parseFloat(formData.get("price") as string)
  const category = formData.get("category") as string
  const sub_category = formData.get("sub_category") as string
  const condition = formData.get("condition") as string
  const description = formData.get("description") as string
  const meetup_area = formData.get("meetup_area") as string
  const images = formData.getAll("images") as File[]

  if (!title || !price || !category || !sub_category || !condition || !description || !meetup_area) {
    return { error: "Please fill in all fields." }
  }

  if (images.length === 0 || images[0].size === 0) {
     return { error: "Please upload at least one image." }
  }

  const imageUrls: string[] = []

  for (const image of images) {
    if (image.size === 0) continue;
    
    const fileExt = image.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('public-items')
      .upload(fileName, image)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: "Failed to upload image." }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('public-items')
      .getPublicUrl(fileName)
    
    imageUrls.push(publicUrl)
  }

  // Fetch user's campus from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('campus')
    .eq('id', user.id)
    .single()

  // Default to 'Main' if fetch fails or value is invalid
  // Allowed values: 'Main', 'Engineering', 'Health'
  const validCampuses = ['Main', 'Engineering', 'Health']
  const userCampus = profile?.campus && validCampuses.includes(profile.campus) 
    ? profile.campus 
    : 'Main'

  const { error: insertError } = await supabase
    .from('items')
    .insert({
      seller_id: user.id,
      title,
      price,
      category,
      sub_category,
      condition,
      description,
      meetup_area,
      campus: userCampus,
      status: 'available',
      images: imageUrls,
    })

  if (insertError) {
    console.error("Database error:", insertError)
    return { error: "Failed to create listing." }
  }

  redirect('/')
}

export async function markItemSold(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from('items')
    .update({ status: 'sold' })
    .eq('id', itemId)
    .eq('seller_id', user.id)

  if (error) {
    console.error("Error marking item sold:", error)
    return { error: "Failed to update item" }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function deleteItem(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from('items')
    .update({ status: 'deleted' })
    .eq('id', itemId)
    .eq('seller_id', user.id)

  if (error) {
    console.error("Error deleting item:", error)
    return { error: "Failed to delete item" }
  }

  revalidatePath('/profile')
  return { success: true }
}
