"use client";

import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import { generateRecipeAction } from "./actions"; // Check your path
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Utensils } from "lucide-react";

// Dummy Data
const TRENDING_RECIPES = [
  {
    id: "1",
    title: "Ayam Gepuk",
    description: "Spicy crushed chicken with sambal.",
    time: "20 Min",
    views: 123,
    image:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    title: "Fresh Salad",
    description: "Healthy garden salad with dressing.",
    time: "10 Min",
    views: 283,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "3",
    title: "Spaghetti Bolognese",
    description: "Classic Italian pasta with meat sauce.",
    time: "30 Min",
    views: 123,
    image:
      "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "4",
    title: "Nasi Briyani",
    description: "Aromatic rice with spices.",
    time: "45 Min",
    views: 123,
    image:
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800",
  },
];

const SUGGESTIONS = [
  "Easy whole-wheat blueberry muffins in 30 mins",
  "Spicy Malaysian fried rice using leftovers",
  "Healthy chicken breast dinner for two",
  "Vegan dessert with chocolate and banana",
];

// 1. DEFINE CUISINE OPTIONS
const CUISINE_TYPES = [
  "Any",
  "Malaysian",
  "Western",
  "Italian",
  "Chinese",
  "Indian",
  "Japanese",
  "Healthy",
  "Dessert",
];

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("Any"); // 2. ADD STATE FOR CUISINE
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ingredients.trim()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("ingredients", ingredients);
    formData.append("cuisine", cuisine); // 3. SEND CUISINE TO BACKEND

    const result = await generateRecipeAction(formData);

    if (result.success && result.recipeId) {
      router.push(`/recipe/${result.recipeId}`);
    } else {
      alert("Error: " + (result.error || "Something went wrong."));
      setLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setIngredients(text);
  };

  return (
    <main className="min-h-screen bg-[url('/bg-img.png')] bg-cover bg-center">
      <Navbar />

      <section className="relative flex flex-col items-center justify-center px-4 pt-16 pb-24 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
          Experience the Future of{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-500">
            Cooking
          </span>{" "}
          <br />
          with AI-Powered Recipes
        </h1>

        <p className="text-gray-500 text-lg max-w-3xl mb-12">
          Let AI inspire your next meal. Select a cuisine and enter your
          ingredients.
        </p>

        {/* --- THE MAGIC INPUT BOX --- */}
        <div className="w-full max-w-3xl relative z-10">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-orange-400 to-red-400 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden no-scrollbar">
              {/* Text Area */}
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Enter ingredients (e.g., Chicken, Garlic, Soy Sauce)..."
                className="w-full h-32 p-6 pb-20 text-lg text-gray-800 placeholder-gray-400 bg-transparent border-none focus:ring-0 resize-none outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />

              {/* Bottom Control Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-white via-white to-transparent flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* 4. CUISINE FILTERS (Scrollable) */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto mask-gradient pr-2">
                  <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase tracking-wider mr-2">
                    <Utensils size={14} /> Style:
                  </div>
                  {CUISINE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCuisine(type)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                        cuisine === type
                          ? "bg-orange-100 border-orange-200 text-orange-600"
                          : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !ingredients.trim()}
                  className="shrink-0 flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />{" "}
                      Generating...
                    </>
                  ) : (
                    <>Submit</>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Suggestions */}
        <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-4xl animate-fade-in-up">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Try these ideas:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-full text-gray-600 text-sm font-medium hover:border-orange-400 hover:text-orange-500 hover:shadow-md transition-all duration-300"
              >
                <Sparkles size={16} className="text-orange-400" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-6 py-10 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Trending Recipes
            </h2>
            <p className="text-gray-500">
              Explore what the community is cooking right now.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRENDING_RECIPES.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      </section>
    </main>
  );
}
