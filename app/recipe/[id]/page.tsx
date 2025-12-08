import { createClient } from "@/lib/supabase/server"; // Note the 'lib' path
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RecipePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // 1. Fetch the recipe from the database using the ID in the URL
  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !recipe) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl text-red-500">Recipe not found!</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  // 2. Parse ingredients/instructions if they are strings (just in case), otherwise use as is
  // (Since we used jsonb, they usually come as arrays automatically)
  const ingredientsList = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : JSON.parse(recipe.ingredients || "[]");

  const instructionsList = Array.isArray(recipe.instructions)
    ? recipe.instructions
    : JSON.parse(recipe.instructions || "[]");

  return (
    <div className="min-h-screen bg-orange-50 p-8 flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header Image or Title */}
        <div className="bg-orange-600 p-6 text-white">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          <p className="mt-2 opacity-90">{recipe.description}</p>
          <div className="flex gap-4 mt-4 text-sm font-semibold">
            <span className="bg-white/20 px-3 py-1 rounded">
              ⏱ {recipe.cooking_time || "N/A"}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded">
              📊 {recipe.difficulty || "Medium"}
            </span>
          </div>
        </div>

        <div className="p-8">
          {/* Ingredients Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              🛒 Ingredients
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {ingredientsList.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Instructions Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              👨‍🍳 Instructions
            </h2>
            <ol className="list-decimal pl-5 space-y-4 text-gray-700">
              {instructionsList.map((step: string, index: number) => (
                <li key={index} className="pl-2">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/"
              className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-black transition"
            >
              Generate Another Recipe
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
