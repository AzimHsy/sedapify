import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileView from '@/components/ProfileView'
import { id } from 'date-fns/locale'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  // 1. User Profile
  const { data: userProfile } = await supabase.from('users').select('*').eq('id', authUser.id).single()

  // 2. My Recipes
  const { data: myRecipes } = await supabase
    .from('recipes')
    .select('*, users(username, avatar_url)')
    .eq('user_id', authUser.id)
    .eq('is_ai_generated', false)
    .order('created_at', { ascending: false })

  // 3. Saved Recipes
  const { data: savedRaw } = await supabase
    .from('saved_recipes')
    .select('recipes(*, users(username, avatar_url))')
    .eq('user_id', authUser.id)
  
  // @ts-ignore
  const savedRecipes = savedRaw?.map(item => item.recipes) || []

  // 4. Liked Recipes
  const { data: likedRaw } = await supabase
    .from('likes')
    .select('recipes(*, users(username, avatar_url))')
    .eq('user_id', authUser.id)

  // 5. Fetch My Videos
  const { data: myVideos } = await supabase
    .from("cooking_videos")
    .select("*, users(username, avatar_url), recipes(id)")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false })

  // 6. Fetch Saved Videos (Where saved_recipes.video_id is not null)
  const { data: savedVideosRaw } = await supabase
    .from("saved_recipes")
    .select("cooking_videos(*, users(username, avatar_url), recipes(id))")
    .eq("user_id", authUser.id)
    .not("video_id", "is", null)

  const savedVideos = savedVideosRaw?.map((item: any) => item.cooking_videos) || []
  
  // @ts-ignore
  const likedRecipes = likedRaw?.map(item => item.recipes) || []

  // --- CALCULATE COUNTS ---

  // Total Likes Received
  const myRecipeIds = myRecipes?.map(r => r.id) || []
  let totalLikesReceived = 0
  if (myRecipeIds.length > 0) {
    const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).in('recipe_id', myRecipeIds)
    totalLikesReceived = count || 0
  }

  // Follower Count (Who follows me?)
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', authUser.id)

  // Following Count (Who do I follow?)
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', authUser.id)

  return (
    <div className="min-h-screen bg-white">
      <ProfileView 
        user={{ ...userProfile, email: authUser.email }}
        currentUserId={authUser.id}
        myRecipes={myRecipes || []}
        savedRecipes={savedRecipes}
        likedRecipes={likedRecipes}
        totalLikesReceived={totalLikesReceived}
        myVideos={myVideos || []}
        followersCount={followersCount || 0}
        followingCount={followingCount || 0}
      />
    </div>
  )
}