import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar' // If you are using Sidebar, this might be unused based on previous steps
import ProfileView from '@/components/ProfileView'
import { redirect } from 'next/navigation'

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params // Target User ID
  const supabase = await createClient()

  // 1. Get Current User (Viewer)
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // 2. Fetch Target Profile
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !userProfile) return <div className="p-10 text-center">User not found</div>

  // 3. Fetch Recipes, Likes, Saved (Same logic as personal profile)
  const { data: myRecipes } = await supabase
    .from('recipes')
    .select('*, users(username, avatar_url)') 
    .eq('user_id', id) // Target ID
    .eq('is_ai_generated', false)
    .order('created_at', { ascending: false })

  const { data: savedRaw } = await supabase
    .from('saved_recipes')
    .select('recipes(*, users(username, avatar_url))') 
    .eq('user_id', id)

  // @ts-ignore
  const savedRecipes = savedRaw?.map(item => item.recipes) || []

  const { data: likedRaw } = await supabase
    .from('likes')
    .select('recipes(*, users(username, avatar_url))')
    .eq('user_id', id)

  // @ts-ignore
  const likedRecipes = likedRaw?.map(item => item.recipes) || []

  // 4 NEW. Fetch Videos
  const { data: myVideos } = await supabase
    .from('cooking_videos')
    .select('*, users(username, avatar_url)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  // 4. Counts
  const myRecipeIds = myRecipes?.map(r => r.id) || []
  let totalLikesReceived = 0
  if (myRecipeIds.length > 0) {
    const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).in('recipe_id', myRecipeIds)
    totalLikesReceived = count || 0
  }

  const { count: followersCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', id)
  const { count: followingCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id)

  // 5. Check if current user is following target user
  let isFollowing = false
  if (currentUser) {
    const { data } = await supabase.from('follows').select().eq('follower_id', currentUser.id).eq('following_id', id).single()
    isFollowing = !!data
  }

  return (
    <div className="min-h-screen bg-white">
      <ProfileView 
        user={userProfile}
        currentUserId={currentUser?.id}
        myRecipes={myRecipes || []}
        savedRecipes={savedRecipes}
        likedRecipes={likedRecipes}
        totalLikesReceived={totalLikesReceived}
        followersCount={followersCount || 0}
        followingCount={followingCount || 0}
        myVideos={myVideos || []}
        isFollowingInitial={isFollowing} // Pass this new prop
      />
    </div>
  )
}