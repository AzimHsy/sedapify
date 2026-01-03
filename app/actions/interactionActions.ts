'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- TOGGLE LIKE ---
export async function toggleLike(recipeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Login required' }

  // Check if exists
  const { data: existing } = await supabase
    .from('likes')
    .select()
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .single()

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id)
    return { liked: false }
  } else {
    await supabase.from('likes').insert({ user_id: user.id, recipe_id: recipeId })
    return { liked: true }
  }
}

// --- TOGGLE SAVE ---
export async function toggleSave(recipeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Login required' }

  const { data: existing } = await supabase
    .from('saved_recipes')
    .select()
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .single()

  if (existing) {
    await supabase.from('saved_recipes').delete().eq('id', existing.id)
    return { saved: false }
  } else {
    await supabase.from('saved_recipes').insert({ user_id: user.id, recipe_id: recipeId })
    return { saved: true }
  }
}

// --- TOGGLE FOLLOW ---
export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Login required' }
  if (user.id === targetUserId) return { error: 'Cannot follow yourself' }

  const { data: existing } = await supabase
    .from('follows')
    .select()
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single()

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id)
    return { following: false }
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
    return { following: true }
  }
}