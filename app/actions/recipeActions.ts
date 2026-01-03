'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteRecipeAction(recipeId: string) {
  const supabase = await createClient()
  
  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 2. Delete Recipe (RLS policies ensure users can only delete their own)
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId)
    .eq('user_id', user.id) // Double check ownership

  if (error) return { error: error.message }

  // 3. Refresh pages
  revalidatePath('/')
  revalidatePath('/profile')
  
  return { success: true }
}

// ... existing imports and deleteRecipeAction ...

// ADD THIS NEW FUNCTION:
export async function updateRecipeAction(recipeId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Extract Data
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const cooking_time = formData.get('cooking_time') as string
  const difficulty = formData.get('difficulty') as string
  const cuisine = formData.get('cuisine') as string
  const meal_type = formData.get('meal_type') as string
  const dietary = formData.get('dietary') as string
  const ingredients = JSON.parse(formData.get('ingredients') as string)
  const instructions = JSON.parse(formData.get('instructions') as string)
  const imageFile = formData.get('image') as File

  const updates: any = {
    title, description, cooking_time, difficulty, ingredients, instructions, cuisine, meal_type, dietary
  }

  // Handle Image Upload (Only if user selected a new one)
  if (imageFile && imageFile.size > 0) {
    const filename = `recipe-${Date.now()}`
    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filename, imageFile)

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(filename)
      updates.image_url = publicUrl
    }
  }

  // Update Database
  const { error } = await supabase
    .from('recipes')
    .update(updates)
    .eq('id', recipeId)
    .eq('user_id', user.id) // Security check

  if (error) return { error: error.message }

  revalidatePath(`/recipe/${recipeId}`)
  revalidatePath('/')
  
  return { success: true }
}