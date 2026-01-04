import FeedWrapper from "@/components/FeedWrapper";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Flame, Utensils, Leaf, Clock } from "lucide-react";
import VideoCard from "@/components/VideoCard"; 

export default async function DiscoverPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch Recipes (Existing logic)
  const { data: allRecipes } = await supabase
    .from("recipes")
    .select(`*, users (username, avatar_url), likes (count)`)
    .not("image_url", "is", null);

  // 2. FETCH VIDEOS (New Logic: Limit 5)
  const { data: videos } = await supabase
    .from("cooking_videos")
    .select(`
        *,
        users (username, avatar_url),
        recipes (id, title)
    `)
    .order('created_at', { ascending: false })
    .limit(5); // <--- CHANGED TO 5

  // ... (Your existing filtering logic for recipes remains here) ...
  // (Trending, Japanese, Vegetarian, New Recipes logic...)
  // For brevity, I'm assuming you kept the logic variables:
  // trendingRecipes, japaneseRecipes, vegetarianRecipes, newRecipes

    // --- DATA PROCESSING (Re-adding briefly so code doesn't break) ---
    if (!allRecipes) return <div>Loading...</div>;
    const trendingRecipes = [...allRecipes].sort((a, b) => (b.likes?.[0]?.count || 0) - (a.likes?.[0]?.count || 0)).slice(0, 8);
    const japaneseRecipes = allRecipes.filter((r) => r.cuisine === "Japanese").slice(0, 4);
    const vegetarianRecipes = allRecipes.filter((r) => r.dietary === "Vegetarian").slice(0, 4);
    const newRecipes = [...allRecipes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
  // -------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      
      {/* --- VIDEO FEED SECTION --- */}
      <div className="pt-10 pb-12 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8 text-gray-900">
                <h2 className="text-2xl font-bold flex items-center gap-2">🔥 Chef Shorts</h2>
                <Link href="/video/upload" className="flex items-center gap-2 bg-gray-900/10 hover:bg-gray-900/20 px-4 py-2 rounded-full text-sm font-bold transition">
                    <Plus size={16} /> Upload Video
                </Link>
            </div>

            {/* GRID LAYOUT (Replaced Scroll) */}
            {/* on Mobile: 2 cols, Tablet: 3 cols, Desktop: 5 cols */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {videos?.map((video) => (
                    <VideoCard 
                        key={video.id} 
                        video={video} 
                        currentUserId={user?.id}
                    />
                ))}
            </div>

            {videos?.length === 0 && (
                <div className="text-gray-500 italic text-center py-10">No videos yet. Be the first to upload!</div>
            )}
         </div>
      </div>
      {/* ------------------------------- */}

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">

        {/* --- SECTION 1: TRENDING --- */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2 text-orange-500 font-bold uppercase tracking-wider text-xs">
                <Flame size={16} /> Hot right now
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Trending Recipes</h2>
            </div>
          </div>
          <FeedWrapper recipes={trendingRecipes} currentUserId={user?.id} />
        </section>

        {/* --- SECTION 2: JAPANESE --- */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2 text-red-500 font-bold uppercase tracking-wider text-xs">
                <Utensils size={16} /> International Flavors
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Taste of Japan</h2>
            </div>
          </div>
          <FeedWrapper recipes={japaneseRecipes} currentUserId={user?.id} />
        </section>
        
        {/* --- SECTION 3: VEGETARIAN --- */}
        <section>
           <div className="flex items-end justify-between mb-8">
            <div>
               <div className="flex items-center gap-2 mb-2 text-green-600 font-bold uppercase tracking-wider text-xs">
                  <Leaf size={16} /> Green & Healthy
               </div>
               <h2 className="text-3xl font-bold text-gray-900">Vegetarian Picks</h2>
            </div>
           </div>
           <FeedWrapper recipes={vegetarianRecipes} currentUserId={user?.id} />
        </section>

        {/* --- SECTION 4: NEW --- */}
        <section>
           <div className="flex items-end justify-between mb-8">
            <div>
               <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold uppercase tracking-wider text-xs">
                  <Clock size={16} /> Just Uploaded
               </div>
               <h2 className="text-3xl font-bold text-gray-900">New Recipes</h2>
            </div>
           </div>
           <FeedWrapper recipes={newRecipes} currentUserId={user?.id} />
        </section>

      </div>
    </div>
  );
}