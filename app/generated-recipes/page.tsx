import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import RecipeModal from "@/components/RecipeModal"; // Optional if you want modals here
import Link from "next/link";
import { Sparkles, ChefHat } from "lucide-react";

export default async function GeneratedRecipesPage() {
  const supabase = await createClient();

  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Fetch Only AI Recipes for this user
  const { data: recipes } = await supabase
    .from("recipes")
    .select(`
      *,
      users (username, avatar_url)
    `)
    .eq("user_id", user.id)
    .eq("is_ai_generated", true) // <--- FILTER FOR AI ONLY
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-10 pb-8 px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2 flex items-center gap-3">
          <Sparkles className="text-orange-500" size={32} /> AI Cookbook
        </h1>
        <p className="text-gray-500 text-lg">
          The collection of recipes you have created with Sedapify AI.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                description={recipe.description}
                time={recipe.cooking_time}
                image={recipe.image_url} 
                views={0}
                author={recipe.users?.username} 
                authorAvatar={recipe.users?.avatar_url}
                cuisine={recipe.cuisine}
                mealType={recipe.meal_type} 
                dietary={recipe.dietary}
                userId={recipe.user_id}
                currentUserId={user.id}
                isAiGenerated={true} // Force true for this page
              />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
               <Sparkles size={40} className="text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No AI recipes yet</h3>
            <p className="text-gray-500 mb-6">Start generating delicious meals with AI.</p>
            <Link 
              href="/" 
              className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition"
            >
              Go to Generator
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}