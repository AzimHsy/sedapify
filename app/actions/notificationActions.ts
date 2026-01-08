'use server'

import { createClient } from '@/lib/supabase/server'

export async function getNotificationsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  // 1. Fetch New Followers
  // "Who is following ME?"
  const { data: follows } = await supabase
    .from('follows')
    .select(`
      created_at,
      follower:users!follows_follower_id_fkey (id, username, avatar_url)
    `)
    .eq('following_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // 2. Fetch Likes on My Recipes
  // We use !inner to filter likes where the LINKED recipe belongs to me
  const { data: likes } = await supabase
    .from('likes')
    .select(`
      created_at,
      user:users (id, username, avatar_url),
      recipe:recipes!inner (id, title, user_id)
    `)
    .eq('recipes.user_id', user.id) // Only my recipes
    .neq('user_id', user.id) // Don't notify me if I like my own post
    .order('created_at', { ascending: false })
    .limit(10)

  // 3. Fetch Saves on My Recipes
  const { data: saves } = await supabase
    .from('saved_recipes')
    .select(`
      created_at,
      user:users (id, username, avatar_url),
      recipe:recipes!inner (id, title, user_id)
    `)
    .eq('recipes.user_id', user.id)
    .neq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // 4. (NEW) Fetch Comments
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      created_at,
      content, 
      user:users (id, username, avatar_url),
      recipe:recipes!inner (id, title, user_id)
    `)
    .eq('recipes.user_id', user.id) // Comments on MY recipes
    .neq('user_id', user.id) // Not my own comments
    .order('created_at', { ascending: false })
    .limit(10)

  // --- MERGE & SORT ---
  const notifications = [
    ...(follows?.map(f => ({ type: 'follow', date: f.created_at, actor: f.follower, content: null })) || []),
    ...(likes?.map(l => ({ type: 'like', date: l.created_at, actor: l.user, content: l.recipe })) || []),
    ...(saves?.map(s => ({ type: 'save', date: s.created_at, actor: s.user, content: s.recipe })) || []),
    ...(comments?.map(c => ({ 
        type: 'comment', 
        date: c.created_at, 
        actor: c.user, 
        content: c.recipe, 
        extraData: c.content
    })) || [])
  ]

  // Sort by newest date
  return notifications.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}