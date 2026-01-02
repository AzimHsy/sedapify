import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileView from '@/components/ProfileView'

export default async function ProfilePage() {
  const supabase = await createClient()

  // 1. Get Current User Auth
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  // 2. Get User Profile Details
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  // 3. Fetch "Your Recipes" (Created by user)
  // CHANGE: Added filter to only show manual uploads (not AI generated)
  const { data: myRecipes } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', authUser.id)
    .eq('is_ai_generated', false) // <--- THIS LINE FILTERS OUT AI RECIPES
    .order('created_at', { ascending: false })

  // 4. Fetch "Favourites" (Saved recipes JOIN recipes)
  const { data: savedRaw } = await supabase
    .from('saved_recipes')
    .select('recipes(*)') 
    .eq('user_id', authUser.id)

  // Flatten the structure for the UI
  // @ts-ignore
  const savedRecipes = savedRaw?.map(item => item.recipes) || []

  // 5. Fetch "Liked" (Likes JOIN recipes)
  const { data: likedRaw } = await supabase
    .from('likes')
    .select('recipes(*)')
    .eq('user_id', authUser.id)

  // Flatten the structure
  // @ts-ignore
  const likedRecipes = likedRaw?.map(item => item.recipes) || []

  // 6. Calculate "Total Likes Received"
  // This will now only count likes on your MANUAL recipes (which is fair!)
  const myRecipeIds = myRecipes?.map(r => r.id) || []
  
  let totalLikesReceived = 0
  if (myRecipeIds.length > 0) {
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .in('recipe_id', myRecipeIds)
    
    totalLikesReceived = count || 0
  }

  return (
    <div className="min-h-screen bg-white">
      <ProfileView 
        user={{ ...userProfile, email: authUser.email }}
        myRecipes={myRecipes || []}
        savedRecipes={savedRecipes}
        likedRecipes={likedRecipes}
        totalLikesReceived={totalLikesReceived}
      />
    </div>
  )
}