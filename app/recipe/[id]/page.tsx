import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, BarChart, ChefHat, User } from "lucide-react";
import RecipeInteraction from "@/components/RecipeInteraction"; // Import the new component

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Validate ID
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (!isValidUUID) {
    return <ErrorDisplay title="Invalid Recipe ID" message="The ID provided is not valid." />;
  }

  const supabase = await createClient();

  // 2. Get Current User (To check if they liked the recipe)
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Fetch Recipe + Author Details
  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*, users(id, username, avatar_url)") // Added 'id' to users select
    .eq("id", id)
    .single();

  if (error || !recipe) {
    return <ErrorDisplay title="Recipe Not Found" message="This recipe might have been deleted or does not exist." />;
  }

  // 4. Check if Current User has Liked this recipe
  let isLiked = false;
  if (user) {
    const { data: likeData } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("recipe_id", recipe.id)
      .single();
    
    isLiked = !!likeData; // True if data exists
  }

  // Parse JSON data safely
  const ingredientsList = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : JSON.parse(recipe.ingredients || "[]");

  const instructionsList = Array.isArray(recipe.instructions)
    ? recipe.instructions
    : JSON.parse(recipe.instructions || "[]");

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- HERO IMAGE SECTION --- */}
      <div className="relative w-full h-[50vh] md:h-[50vh] bg-gray-900">
        {recipe.image_url ? (
          <Image 
            src={recipe.image_url} 
            alt={recipe.title} 
            fill 
            className="object-cover opacity-90"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-600">
            <ChefHat size={80} className="text-white/30" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-6 left-6 z-20">
          <Link href="/" className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-white/30 transition">
            <ArrowLeft size={20} /> <span className="font-medium">Back</span>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-10 text-white max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.cuisine && <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{recipe.cuisine}</span>}
            {recipe.meal_type && <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{recipe.meal_type}</span>}
            {recipe.dietary && <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{recipe.dietary}</span>}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            {recipe.title}
          </h1>

          <div className="flex flex-col md:flex-row mb-4 md:items-center gap-6 text-sm md:text-base font-medium">
            
            {/* CLICKABLE AUTHOR LINK */}
            <Link href={`/profile/${recipe.user_id}`} className="flex items-center gap-3 group hover:opacity-90 transition">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative border-1 border-white transition">
                {recipe.users?.avatar_url ? (
                  <Image src={recipe.users.avatar_url} alt="Author" fill className="object-cover" />
                ) : (
                  <User className="p-2 w-full h-full text-gray-500" />
                )}
              </div>
              <span>By <span className="font-bold transition">{recipe.users?.username || 'Unknown Chef'}</span></span>
            </Link>

            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-2"><Clock size={18} /> {recipe.cooking_time || "30m"}</div>
              <div className="flex items-center gap-2"><BarChart size={18} /> {recipe.difficulty || "Easy"}</div>
            </div>

          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6 md:p-10">
          
          <div className="grid lg:grid-cols-3 gap-10">
            
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">About this dish</h3>
                <p className="text-gray-600 leading-relaxed italic border-l-4 border-orange-500 pl-4 bg-orange-50 p-4 rounded-r-lg">
                  "{recipe.description}"
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🛒 Ingredients
                </h3>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <ul className="space-y-4">
                    {ingredientsList.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-1 min-w-[20px] h-5 rounded-full border-2 border-orange-300 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-700 font-medium leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  👨‍🍳 Preparation
                </h3>
                
                {/* INSERT CLIENT COMPONENT FOR BUTTONS */}
                <RecipeInteraction 
                  recipeId={recipe.id} 
                  currentUser={user} 
                  initialIsLiked={isLiked} 
                />

              </div>

              <div className="space-y-8 relative before:absolute before:left-[19px] before:top-4 before:h-full before:w-0.5 before:bg-gray-200">
                {instructionsList.map((step: string, index: number) => (
                  <div key={index} className="flex gap-6 relative">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-md z-10 ring-4 ring-white">
                      {index + 1}
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex-1 hover:shadow-md transition">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 text-center">
                <p className="text-gray-500 mb-4">Did you make this recipe?</p>
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition transform hover:-translate-y-1"
                >
                  <ChefHat size={20} /> Make Something Else
                </Link>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorDisplay({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F0] p-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-orange-100">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ChefHat size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Link
          href="/"
          className="inline-block w-full bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}