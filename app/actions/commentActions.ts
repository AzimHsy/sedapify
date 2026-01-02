'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function postComment(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to comment' }

  const recipeId = formData.get('recipeId') as string
  const content = formData.get('content') as string

  if (!content.trim()) return { error: 'Comment cannot be empty' }

  const { error } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,
      recipe_id: recipeId,
      content: content
    })

  if (error) return { error: error.message }

  revalidatePath('/') // Refresh the feed
  return { success: true }
}