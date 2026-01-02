import RecipeCard from "@/components/RecipeCard";
import RecipeGenerator from "@/components/RecipeGenerator"; 
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // FETCH RECIPES + USERNAME + AVATAR
  const { data: recipes } = await supabase
    .from("recipes")
    .select(`
      *,
      users (
        username,
        avatar_url
      )
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

        {recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recipes.map((recipe: any) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                description={recipe.description}
                time={recipe.cooking_time || "30 Min"}
                image={recipe.image_url} 
                views={0}
                author={recipe.users?.username} 
                authorAvatar={recipe.users?.avatar_url} // PASS THE AVATAR HERE
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