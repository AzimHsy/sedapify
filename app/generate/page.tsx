"use client"; // This is required because we use useState and useRouter

import { generateRecipeAction } from "../actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Stop the form from reloading the page
    setLoading(true);

    // Create FormData from the form element
    const formData = new FormData(e.currentTarget);

    // Call the Server Action
    const result = await generateRecipeAction(formData);

    if (result.success && result.recipeId) {
      // If successful, go to the new recipe page
      router.push(`/recipe/${result.recipeId}`);
    } else {
      alert(
        "Error: " + (result.error || "Something went wrong. Are you logged in?")
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 p-6">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Logo / Header */}
        <div>
          <h1 className="text-5xl font-extrabold text-orange-600 tracking-tight">
            Sedapify 🍳
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Smart AI Cooking Assistant. Enter your ingredients, get a recipe.
          </p>
        </div>

        {/* The Input Form */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-orange-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-left">
              <label
                htmlFor="ingredients"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                What's in your kitchen?
              </label>
              <textarea
                id="ingredients"
                name="ingredients"
                required
                placeholder="e.g. Chicken breast, soy sauce, garlic, rice..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg shadow-md transition-all 
                ${
                  loading
                    ? "bg-orange-300 cursor-not-allowed"
                    : "bg-orange-600 hover:bg-orange-700 hover:shadow-lg transform hover:-translate-y-0.5"
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating Recipe...
                </span>
              ) : (
                "Generate Recipe ✨"
              )}
            </button>
          </form>
        </div>

        {/* Footer/Links */}
        <p className="text-sm text-gray-500">Final Year Project (DITU 3964)</p>
      </div>
    </div>
  );
}
