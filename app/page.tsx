import RecipeGenerator from "@/components/RecipeGenerator"; 
import FeedWrapper from "@/components/FeedWrapper";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, ShoppingBasket, PlayCircle, Sparkles, ChefHat, TrendingUp } from "lucide-react";
import Image from "next/image";

export default async function Home() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. Fetch User Profile
  let userProfile = null;
  // 2. Fetch User's Liked Recipe IDs (Restored Logic)
  let likedRecipeIds: string[] = [];

  if (user) {
    const { data } = await supabase.from('users').select('username, avatar_url').eq('id', user.id).single();
    userProfile = data;

    // Fetch the list of recipes this user has liked
    const { data: likes } = await supabase
        .from('likes')
        .select('recipe_id')
        .eq('user_id', user.id);
    
    if (likes) {
        likedRecipeIds = likes.map(l => l.recipe_id);
    }
  }

  // 3. Fetch Recipes
  const { data: recipes } = await supabase
    .from("recipes")
    .select(`
      *,
      users (username, avatar_url)
    `)
    .not("image_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <main className="min-h-screen bg-[#FDF8F0] pb-24">
      
      {/* HEADER */}
      <div className="bg-white/60 backdrop-blur-md pt-10 pb-10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Hello, <span className="text-orange-600 italic">{userProfile?.username || 'Chef'}!</span>
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">Ready to cook something amazing?</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-10 mt-2">

        {/* AI GENERATOR HERO */}
        <div className="overflow-hidden relative group hover:shadow-orange-200/60 transition-all duration-500">
          <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-2xl" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-tr from-orange-100/40 to-yellow-100/40 rounded-full blur-3xl" />
          <div className="relative z-10 -mt-20 -mb-10"> 
            <RecipeGenerator />
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <Link href="/groceries" className="group relative bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 transition-all duration-300 p-6 md:p-7 rounded-3xl flex flex-col items-start gap-4 border-2 border-green-200/50 hover:border-green-300 hover:shadow-xl hover:shadow-green-200/50 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-300/20 rounded-full blur-2xl group-hover:bg-green-300/30 transition-all" />
            <div className="relative bg-white p-3 rounded-2xl text-green-600 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <ShoppingBasket size={26} strokeWidth={2.5} />
            </div>
            <div className="relative">
              <h3 className="font-bold text-green-900 text-lg mb-1">Buy Ingredients</h3>
              <p className="text-xs text-green-700/80 font-medium">Fast delivery to you</p>
            </div>
          </Link>

          <Link href="/reels" className="group relative bg-gradient-to-br from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200 transition-all duration-300 p-6 md:p-7 rounded-3xl flex flex-col items-start gap-4 border-2 border-purple-200/50 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-200/50 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-300/20 rounded-full blur-2xl group-hover:bg-purple-300/30 transition-all" />
            <div className="relative bg-white p-3 rounded-2xl text-purple-600 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <PlayCircle size={26} strokeWidth={2.5} />
            </div>
            <div className="relative">
              <h3 className="font-bold text-purple-900 text-lg mb-1">Watch Shorts</h3>
              <p className="text-xs text-purple-700/80 font-medium">Get inspired instantly</p>
            </div>
          </Link>

          <Link href="/ranking" className="group relative hidden md:flex bg-gradient-to-br from-orange-50 to-amber-100 hover:from-orange-100 hover:to-amber-200 transition-all duration-300 p-6 md:p-7 rounded-3xl flex-col items-start gap-4 border-2 border-orange-200/50 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-200/50 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-300/20 rounded-full blur-2xl group-hover:bg-orange-300/30 transition-all" />
            <div className="relative bg-white p-3 rounded-2xl text-orange-600 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <TrendingUp size={26} strokeWidth={2.5} />
            </div>
            <div className="relative">
              <h3 className="font-bold text-orange-900 text-lg mb-1">Leaderboard</h3>
              <p className="text-xs text-orange-700/80 font-medium">Top chefs this week</p>
            </div>
          </Link>
        </div>

        {/* FEED */}
        <section className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-orange-600 font-bold uppercase tracking-wider text-xs">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <Sparkles size={14} />
                </div>
                Community
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Fresh from the Kitchen
              </h2>
              <p className="text-gray-600 text-sm">Discover what our community is cooking today</p>
            </div>
            <Link 
              href="/discover" 
              className="group text-sm font-bold text-gray-600 hover:text-orange-600 flex items-center gap-2 transition-all duration-300 bg-white hover:bg-orange-50 px-4 py-2 rounded-full border-2 border-gray-200 hover:border-orange-200 shadow-sm"
            >
              View All 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {recipes && recipes.length > 0 ? (
            <FeedWrapper 
                recipes={recipes} 
                currentUserId={user?.id}
                likedRecipeIds={likedRecipeIds} // <--- CRITICAL FIX: Pass this prop
            />
          ) : (
            <div className="text-center py-24 bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                <ChefHat className="text-orange-600" size={32} />
              </div>
              <p className="text-gray-900 font-bold text-lg mb-2">No community recipes yet.</p>
              <p className="text-gray-500 text-sm">Be the first to generate and share one!</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}