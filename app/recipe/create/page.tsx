"use client";

import { createManualRecipe } from "@/app/actions/userActions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Upload, Loader2, ChefHat } from "lucide-react";
import Image from "next/image";

export default function CreateRecipe() {
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Helper to update dynamic arrays
  const handleArrayChange = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    list: string[]
  ) => {
    const newList = [...list];
    newList[index] = value;
    setter(newList);
  };

  const addField = (setter: any, list: any) => setter([...list, ""]);

  const removeField = (index: number, setter: any, list: any) => {
    if (list.length > 1) {
      const newList = list.filter((_: any, i: number) => i !== index);
      setter(newList);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // Append the dynamic lists as JSON strings so backend can parse them
    // Filter out empty lines
    const cleanIngredients = ingredients.filter((i) => i.trim() !== "");
    const cleanInstructions = instructions.filter((i) => i.trim() !== "");

    formData.set("ingredients", JSON.stringify(cleanIngredients));
    formData.set("instructions", JSON.stringify(cleanInstructions));

    const result = await createManualRecipe(formData);

    if (result?.error) {
      alert(result.error);
      setLoading(false);
    }
    // Success redirect is handled in the server action
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] p-6 flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl border border-orange-100 p-8 md:p-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Share Your Recipe
          </h1>
          <p className="text-gray-500">
            Share your culinary masterpiece with the Sedapify community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block font-bold text-gray-700 mb-2">
                Recipe Title
              </label>
              <input
                name="title"
                required
                placeholder="e.g. Nenek's Nasi Lemak"
                className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">
                Cooking Time
              </label>
              <input
                name="cooking_time"
                required
                placeholder="e.g. 45 mins"
                className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                name="difficulty"
                className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
                <option>Chef Level</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              required
              placeholder="Tell us about this dish..."
              className="w-full border p-4 rounded-xl h-24 resize-none focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* 2. Image Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition">
            <input
              type="file"
              name="image"
              accept="image/*"
              id="recipe-image"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImagePreview(URL.createObjectURL(file));
              }}
            />
            <label htmlFor="recipe-image" className="cursor-pointer block">
              {imagePreview ? (
                <div className="relative w-full h-64 rounded-xl overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-500 py-8">
                  <Upload size={32} className="mb-2" />
                  <span>Click to upload a cover photo</span>
                </div>
              )}
            </label>
          </div>

          {/* 3. Ingredients (Dynamic) */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Ingredients
            </h3>
            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={ing}
                    onChange={(e) =>
                      handleArrayChange(
                        index,
                        e.target.value,
                        setIngredients,
                        ingredients
                      )
                    }
                    placeholder={`Ingredient ${index + 1}`}
                    className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeField(index, setIngredients, ingredients)
                      }
                      className="p-3 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Minus size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField(setIngredients, ingredients)}
                className="flex items-center gap-2 text-orange-600 font-bold mt-2 hover:bg-orange-50 px-4 py-2 rounded-lg transition"
              >
                <Plus size={18} /> Add Ingredient
              </button>
            </div>
          </div>

          {/* 4. Instructions (Dynamic) */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Instructions
            </h3>
            <div className="space-y-3">
              {instructions.map((step, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="mt-4 font-bold text-gray-400 w-6">
                    {index + 1}.
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) =>
                      handleArrayChange(
                        index,
                        e.target.value,
                        setInstructions,
                        instructions
                      )
                    }
                    placeholder={`Step ${index + 1}`}
                    className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    rows={2}
                    required
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeField(index, setInstructions, instructions)
                      }
                      className="p-3 text-red-500 hover:bg-red-50 rounded-lg mt-1"
                    >
                      <Minus size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField(setInstructions, instructions)}
                className="flex items-center gap-2 text-orange-600 font-bold mt-2 hover:bg-orange-50 px-4 py-2 rounded-lg transition"
              >
                <Plus size={18} /> Add Step
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ChefHat />}
            Publish Recipe
          </button>
        </form>
      </div>
    </div>
  );
}
