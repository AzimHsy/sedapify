import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";
import { Upload } from "lucide-react";

// Dummy Data to mimic the image (Replace with Supabase data later)
const TRENDING_RECIPES = [
  {
    id: "1",
    title: "Ayam Gepuk",
    description:
      "Nasi goreng kampung is a spicy Malaysian village-style fried rice.",
    time: "10 Min",
    views: 123,
    image:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    title: "Salad",
    description: "Fresh garden salad with balsamic vinaigrette.",
    time: "10 Min",
    views: 283,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "3",
    title: "Spaghetti Bolognese",
    description: "Classic Italian pasta with rich meat sauce.",
    time: "10 Min",
    views: 123,
    image:
      "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "4",
    title: "Nasi Briyani",
    description: "Aromatic rice dish cooked with spices and meat.",
    time: "10 Min",
    views: 123,
    image:
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDF8F0]">
      {" "}
      {/* Beige Background from image */}
      <Navbar />
      {/* --- HERO SECTION --- */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-20 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Experience the Future of{" "}
          <span className="text-orange-400">Cooking</span> <br />
          with AI-Powered Recipes
        </h1>
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mb-10">
          Let AI inspire your next meal with personalized recipe suggestions
          based on your ingredients.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/generate"
            className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-orange-200 transition transform hover:-translate-y-1"
          >
            Quick Generate
          </Link>
          <button className="flex items-center gap-2 bg-white text-gray-900 font-bold py-4 px-8 rounded-full shadow-sm hover:shadow-md transition border border-gray-100">
            <Upload size={20} />
            Upload Recipe
          </button>
        </div>
      </section>
      {/* --- TRENDING RECIPES SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Trending Recipes
            </h2>
            <p className="text-gray-500 max-w-lg">
              Explore what everyone's cooking right now. Discover delicious
              trending recipes loved by home cooks.
            </p>
          </div>
          <Link
            href="/discover"
            className="text-gray-600 hover:text-orange-500 flex items-center gap-2 font-medium"
          >
            Explore More &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRENDING_RECIPES.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      </section>
      {/* --- NEW RECIPES SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 py-10 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              New Recipes
            </h2>
            <p className="text-gray-500 max-w-lg">
              Discover the hottest trending recipes and favorite masakan panas
              everyone's craving right now.
            </p>
          </div>
          <Link
            href="/discover"
            className="text-gray-600 hover:text-orange-500 flex items-center gap-2 font-medium"
          >
            Explore More &rarr;
          </Link>
        </div>

        {/* Reusing the same data for visual demo, but you would fetch 'new' recipes here */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRENDING_RECIPES.slice()
            .reverse()
            .map((recipe) => (
              <RecipeCard key={recipe.id} {...recipe} />
            ))}
        </div>
      </section>
    </main>
  );
}
