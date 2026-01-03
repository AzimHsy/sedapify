import { createClient } from '@/lib/supabase/server'
import RankingView from '@/components/RankingView'

export default async function RankingPage() {
  const supabase = await createClient()

  // 1. FETCH USERS + FOLLOWERS COUNT
  // We fetch the 'follows' table where 'following_id' matches the user
  const { data: usersRaw } = await supabase
    .from('users')
    .select(`
      id, username, email, avatar_url,
      follows!follows_following_id_fkey (count)
    `)
    // Note: We cannot order by count easily in API, so we fetch and sort in JS.
    // Ideally, for millions of users, you'd use a Database View or RPC.
    .limit(100) 

  // 2. Process Users (Sort by Followers)
  const topUsers = usersRaw
    ?.map((user: any) => ({
      ...user,
      followers_count: user.follows?.[0]?.count || 0
    }))
    .sort((a, b) => b.followers_count - a.followers_count)
    .slice(0, 10) || []


  // 3. FETCH RECIPES + LIKES COUNT
  const { data: recipesRaw } = await supabase
    .from('recipes')
    .select(`
      id, title, image_url, created_at,
      users (username),
      likes (count)
    `)
    .not('image_url', 'is', null)
    .limit(100)

  // 4. Process Recipes (Sort by Likes)
  const topRecipes = recipesRaw
    ?.map((recipe: any) => ({
      ...recipe,
      likes_count: recipe.likes?.[0]?.count || 0
    }))
    .sort((a, b) => b.likes_count - a.likes_count)
    .slice(0, 10) || []

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <RankingView topUsers={topUsers} topRecipes={topRecipes} />
    </div>
  )
}