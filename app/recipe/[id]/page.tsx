import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, BarChart, ChefHat, User, Sparkles, ShoppingBasket } from "lucide-react";
import RecipeInteraction from "@/components/RecipeInteraction";
import RecipeCard from "@/components/RecipeCard";
import DietaryGuard from "@/components/DietaryGuard"; // <--- 1. IMPORT THIS

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ... (Keep existing validation code) ...
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isValidUUID) return <ErrorDisplay title="Invalid Recipe ID" message="The ID provided is not valid." />;

  const supabase = await createClient();

  // 2. Fetch User WITH 'dietary_pref'
  const { data: { user } } = await supabase.auth.getUser();
  
  let userDietaryPref = 'Standard'; // Default
  if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('dietary_pref') // Make sure you fetch this
        .eq('id', user.id)
        .single();
      if (profile?.dietary_pref) userDietaryPref = profile.dietary_pref;
  }

  // 3. Fetch Recipe
  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*, users(id, username, avatar_url)")
    .eq("id", id)
    .single();

  if (error || !recipe) return <ErrorDisplay title="Recipe Not Found" message="Deleted or does not exist." />;

  // ... (Keep existing Like/Save logic) ...
  let isLiked = false;
  let isSaved = false;
  if (user) {
    const [likeResponse, saveResponse] = await Promise.all([
      supabase.from("likes").select("id").eq("user_id", user.id).eq("recipe_id", recipe.id).single(),
      supabase.from("saved_recipes").select("id").eq("user_id", user.id).eq("recipe_id", recipe.id).single()
    ]);
    isLiked = !!likeResponse.data;
    isSaved = !!saveResponse.data;
  }

  // ... (Keep existing Suggested Recipes Logic) ...
  const { data: pool } = await supabase
    .from("recipes")
    .select("*, users(id, username, avatar_url)")
    .neq("id", id)                 
    .eq("is_ai_generated", false)  
    .not("image_url", "is", null)  
    .limit(20);                    
  const suggestions = pool ? pool.sort(() => 0.5 - Math.random()).slice(0, 4) : [];

  // ... (Keep existing Parsing logic) ...
  const ingredientsList = Array.isArray(recipe.ingredients) ? recipe.ingredients : JSON.parse(recipe.ingredients || "[]");
  const instructionsList = Array.isArray(recipe.instructions) ? recipe.instructions : JSON.parse(recipe.instructions || "[]");

  return (
    // 4. WRAP EVERYTHING IN THE GUARD
    // Pass the user's preference and the recipe's dietary tag
    <DietaryGuard userPref={userDietaryPref} recipeType={recipe.dietary || 'Standard'}>
        
        <div className="min-h-screen bg-gray-50 pb-20">
          
          {/* ... ALL YOUR EXISTING JSX CONTENT GOES HERE UNCHANGED ... */}
          {/* ... Hero Image Section ... */}
          <div className="relative w-full h-[50vh] md:h-[50vh] bg-gray-900">
             {/* ... Copy the image code ... */}
             {recipe.image_url ? (
                <Image src={recipe.image_url} alt={recipe.title} fill className="object-cover opacity-90" priority />
             ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-600"><ChefHat size={80} className="text-white/30" /></div>
             )}
             {/* ... etc ... */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
             <div className="absolute top-6 left-6 z-20">
                <Link href="/" className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-white/30 transition">
                    <ArrowLeft size={20} /> <span className="font-medium">Back</span>
                </Link>
             </div>
             {/* ... Title, tags, etc ... */}
             <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-10 text-white max-w-7xl mx-auto">
                {/* ... tags ... */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {recipe.cuisine && <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{recipe.cuisine}</span>}
                    {recipe.dietary && <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{recipe.dietary}</span>}
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4">{recipe.title}</h1>
                {/* ... rest of hero ... */}
             </div>
          </div>

          {/* ... Main Content Section (Ingredients, etc) ... */}
          <div className="max-w-7xl mx-auto px-4 md:px-10 -mt-8 relative z-20 mb-16">
             <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6 md:p-10">
                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1 space-y-8">
                        <div>
                            <h3 className="text-gray-900 font-bold text-lg mb-2">About this dish</h3>
                            <p className="text-gray-600 leading-relaxed italic border-l-4 border-orange-500 pl-4 bg-orange-50 p-4 rounded-r-lg">"{recipe.description}"</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">🛒 Ingredients</h3>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <ul className="space-y-4">
                                    {ingredientsList.map((item: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="mt-1 min-w-[20px] h-5 rounded-full border-2 border-orange-300 flex items-center justify-center"><div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div></div>
                                            <span className="text-gray-700 font-medium leading-tight">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <Link href="/groceries" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-100 transform hover:-translate-y-0.5">
                                        <ShoppingBasket size={20} /> Missing Ingredients?
                                    </Link>
                                    <p className="text-center text-xs text-gray-400 mt-2">Get fresh ingredients delivered in minutes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ... Right Column (Instructions) ... */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">👨‍🍳 Preparation</h3>
                            <RecipeInteraction recipeId={recipe.id} currentUser={user} initialIsLiked={isLiked} initialIsSaved={isSaved} />
                        </div>
                        <div className="space-y-8 relative before:absolute before:left-[19px] before:top-4 before:h-full before:w-0.5 before:bg-gray-200">
                            {instructionsList.map((step: string, index: number) => (
                                <div key={index} className="flex gap-6 relative">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-md z-10 ring-4 ring-white">{index + 1}</div>
                                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex-1 hover:shadow-md transition">
                                        <p className="text-gray-700 leading-relaxed text-lg">{step}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-16 text-center">
                            <p className="text-gray-500 mb-4">Did you make this recipe?</p>
                            <Link href="/" className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition transform hover:-translate-y-1"><ChefHat size={20} /> Make Something Else</Link>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* ... Suggestions ... */}
          {suggestions && suggestions.length > 0 && (
            <div className="max-w-7xl mx-auto px-6 md:px-10 pb-10">
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="text-orange-500" size={24} />
                    <h2 className="text-2xl font-bold text-gray-900">More from the Community</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {suggestions.map((item) => (
                        <RecipeCard key={item.id} id={item.id} title={item.title} description={item.description} time={item.cooking_time} image={item.image_url} views={0} author={item.users?.username} authorAvatar={item.users?.avatar_url} cuisine={item.cuisine} mealType={item.meal_type} dietary={item.dietary} userId={item.user_id} currentUserId={user?.id} isAiGenerated={item.is_ai_generated} />
                    ))}
                </div>
            </div>
          )}

        </div>

    </DietaryGuard>
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