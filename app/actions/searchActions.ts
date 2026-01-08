'use server'

import { createClient } from '@/lib/supabase/server'

export async function searchGlobalAction(query: string) {
  if (!query || query.length < 2) return { users: [], recipes: [] }

  const supabase = await createClient()

  // 1. Search Users
  const { data: users } = await supabase
    .from('users')
    .select('id, username, avatar_url')
    .ilike('username', `%${query}%`)
    .limit(5)

  // 2. Search Recipes
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, title, image_url, cuisine, users(username)') 
    .ilike('title', `%${query}%`)
    .limit(5)

  if (error) {
    console.error("Recipe Error:", error.message)
    return { users: users || [], recipes: [] }
  }

  return {
    users: users || [],
    recipes: recipes || []
  }
}