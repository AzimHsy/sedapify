import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import RecipeGenerator from "@/components/RecipeGenerator"; // Import the new component
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // 1. FETCH REAL RECIPES FROM DB
  // We filter for recipes that have an image and order by newest
  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .not("image_url", "is", null) // Only show recipes with images
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <main className="min-h-screen bg-[url('/bg-img.png')] bg-cover bg-center">
      <Navbar />

      {/* --- HERO SECTION (Client Component) --- */}
      <RecipeGenerator />

      {/* --- TRENDING RECIPES SECTION (Server Data) --- */}
      <section className="max-w-7xl mx-auto px-6 py-10 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Fresh from the Community
            </h2>
            <p className="text-white">
              Explore the latest recipes uploaded by our users.
            </p>
          </div>
        </div>

        {/* Display Recipes */}
        {recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                description={recipe.description}
                // Use the database columns:
                time={recipe.cooking_time || "30 Min"}
                image={recipe.image_url} // This comes from your upload feature
                views={0} // Default view count for now
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No community recipes yet.</p>
            <p className="text-sm text-gray-400">Be the first to upload one!</p>
          </div>
        )}
      </section>
    </main>
  );
}