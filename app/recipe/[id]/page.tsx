import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Clock, BarChart, ChefHat } from "lucide-react";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Validate ID before calling Database
  // If the ID is not a valid UUID (e.g. "undefined"), show error immediately
  const isValidUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (!isValidUUID) {
    return (
      <ErrorDisplay
        title="Invalid Recipe ID"
        message={`The ID "${id}" is not valid. Please try generating a new recipe.`}
      />
    );
  }

  const supabase = await createClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  // 2. Debugging Log (Check your VS Code Terminal)
  if (error) {
    console.log("----------------ERROR DETAILS----------------");
    console.log("Requested ID:", id);
    console.log("Supabase Message:", error.message);
    console.log("Supabase Details:", error.details);
    console.log("---------------------------------------------");
  }

  if (error || !recipe) {
    return (
      <ErrorDisplay
        title="Recipe Not Found"
        message="We couldn't find this recipe in the database. It might have been deleted or you don't have permission to view it."
      />
    );
  }

  // Parse JSON data safely
  const ingredientsList = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : JSON.parse(recipe.ingredients || "[]");

  const instructionsList = Array.isArray(recipe.instructions)
    ? recipe.instructions
    : JSON.parse(recipe.instructions || "[]");

  return (
    <div className="min-h-screen bg-[#FDF8F0] p-4 md:p-8 flex justify-center">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
        {/* Header Section */}
        <div className="bg-orange-500 p-8 md:p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-orange-100 hover:text-white mb-6 transition"
            >
              <ArrowLeft size={20} /> Back to Generator
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              {recipe.title}
            </h1>
            <p className="text-lg text-orange-100 max-w-2xl">
              {recipe.description}
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-medium">
                <Clock size={18} /> {recipe.cooking_time || "30 mins"}
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-medium">
                <BarChart size={18} /> {recipe.difficulty || "Medium"}
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
            <ChefHat size={300} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 p-8 md:p-12">
          {/* Ingredients Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                🛒 Ingredients
              </h2>
              <ul className="space-y-3">
                {ingredientsList.map((item: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-700 text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions Column */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              👨‍🍳 Cooking Instructions
            </h2>
            <div className="space-y-6">
              {instructionsList.map((step: string, index: number) => (
                <div key={index} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    {index + 1}
                  </div>
                  <p className="text-gray-600 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
              <Link
                href="/"
                className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                <ChefHat size={20} /> Generate Another Recipe
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for errors
function ErrorDisplay({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F0] p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-orange-100">
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
