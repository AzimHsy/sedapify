import RecipeGenerator from "@/components/RecipeGenerator"; 
import FeedWrapper from "@/components/FeedWrapper";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser()
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
    <main className="min-h-screen bg-[url('/bg-img.png')] bg-cover bg-center">
      <RecipeGenerator />

      <section className="max-w-7xl mx-auto px-6 py-10 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Fresh from the Community
            </h2>
            <p className="text-gray-500">
              Explore the latest recipes uploaded by our users.
            </p>
          </div>
        </div>

        {/* Use the Wrapper instead of mapping directly */}
        {recipes && recipes.length > 0 ? (
          <FeedWrapper recipes={recipes} currentUserId={user?.id} />
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No community recipes yet.</p>
          </div>
        )}
      </section>
    </main>
  );
}