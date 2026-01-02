import FeedWrapper from "@/components/FeedWrapper";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, Flame, Clock } from "lucide-react";

export default async function DiscoverPage() {
  const supabase = await createClient();
  
  // 1. Get Current User (to pass to FeedWrapper for ownership checks)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. FETCH ALL RECIPES
  // We fetch 'likes(count)' to know how many likes each recipe has
  const { data: allRecipes } = await supabase
    .from("recipes")
    .select(`
      *,
      users (username, avatar_url),
      likes (count)
    `)
    .not("image_url", "is", null);

  if (!allRecipes) return <div>Loading...</div>;

  // 3. PREPARE DATA

  // --- Logic for NEW RECIPES (Sort by Date) ---
  const newRecipes = [...allRecipes]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4); // Take top 4

  // --- Logic for TRENDING RECIPES (Sort by Likes Count) ---
  const trendingRecipes = [...allRecipes]
    .sort((a, b) => {
      // @ts-ignore: Supabase returns count as an array of objects sometimes, handling safe access
      const likesA = a.likes?.[0]?.count || 0;
      // @ts-ignore
      const likesB = b.likes?.[0]?.count || 0;
      return likesB - likesA; // Higher likes first
    })
    .slice(0, 4); // Take top 4

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 pt-10 pb-8 px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
          Discover
        </h1>
        <p className="text-gray-500 text-lg">
          Explore delicious recipes from the Sedapify community.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">

        {/* --- SECTION 1: TRENDING RECIPES --- */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2 text-orange-500 font-bold uppercase tracking-wider text-xs">
                <Flame size={16} /> Hot right now
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Trending Recipes
              </h2>
              <p className="text-gray-500 mt-1">
                Most loved dishes by our community this week.
              </p>
            </div>
            <Link href="/ranking" className="group flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition">
              See Leaderboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {trendingRecipes.length > 0 ? (
            <FeedWrapper recipes={trendingRecipes} currentUserId={user?.id} />
          ) : (
            <EmptyState message="No trending recipes yet. Be the first to go viral!" />
          )}
        </section>

        {/* --- SECTION 2: NEW RECIPES --- */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold uppercase tracking-wider text-xs">
                <Clock size={16} /> Just Uploaded
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                New Recipes
              </h2>
              <p className="text-gray-500 mt-1">
                Discover the hottest trending recipes and favorite masakan panas right now.
              </p>
            </div>
            <button className="group flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition">
              Explore More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {newRecipes.length > 0 ? (
            <FeedWrapper recipes={newRecipes} currentUserId={user?.id} />
          ) : (
            <EmptyState message="No new recipes yet." />
          )}
        </section>

      </div>
    </div>
  );
}

// Helper UI for empty states
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
      <p className="text-gray-400 font-medium">{message}</p>
    </div>
  )
}