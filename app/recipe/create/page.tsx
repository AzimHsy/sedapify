'use client'

import { createManualRecipe } from '@/app/actions/userActions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Upload, Loader2, ChefHat } from 'lucide-react'
import Image from 'next/image'

// DEFINITIONS
const CUISINES = ["Malaysian", "Western", "Chinese", "Korean", "Japanese", "Indian", "Fusion"]
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"]
const DIETS = ["Halal", "Vegetarian", "Vegan", "Low-carb", "High-protein"]

export default function CreateRecipe() {
  // ... existing states ...
  const [ingredients, setIngredients] = useState<string[]>([''])
  const [instructions, setInstructions] = useState<string[]>([''])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // NEW STATES
  const [selectedCuisine, setSelectedCuisine] = useState("")
  const [selectedMeal, setSelectedMeal] = useState("")
  const [selectedDiet, setSelectedDiet] = useState("")

  const router = useRouter()

  // ... helper functions (handleArrayChange, etc) ...
  const handleArrayChange = (index: number, value: string, setter: any, list: any) => {
    const newList = [...list]
    newList[index] = value
    setter(newList)
  }
  const addField = (setter: any, list: any) => setter([...list, ''])
  const removeField = (index: number, setter: any, list: any) => {
    if (list.length > 1) {
      const newList = list.filter((_: any, i: number) => i !== index)
      setter(newList)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    // ... existing logic ...
    const cleanIngredients = ingredients.filter(i => i.trim() !== '')
    const cleanInstructions = instructions.filter(i => i.trim() !== '')
    formData.set('ingredients', JSON.stringify(cleanIngredients))
    formData.set('instructions', JSON.stringify(cleanInstructions))

    // NEW: Append selected tags
    formData.set('cuisine', selectedCuisine)
    formData.set('meal_type', selectedMeal)
    formData.set('dietary', selectedDiet)

    const result = await createManualRecipe(formData)
    // ... error handling ...
    if (result?.error) {
        alert(result.error)
        setLoading(false)
    }
  }

  // REUSABLE TAG COMPONENT
  const TagSelector = ({ title, options, selected, setSelected }: any) => (
    <div>
      <label className="block font-bold text-gray-700 mb-3">{title}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            type="button"
            onClick={() => setSelected(opt === selected ? "" : opt)} // Toggle
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              selected === opt
                ? "bg-orange-500 text-white border-orange-500 shadow-md transform scale-105"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF8F0] p-6 flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl border border-orange-100 p-8 md:p-12">
        {/* ... Header ... */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Recipe</h1>
          <p className="text-gray-500">Share your culinary masterpiece.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ... Title, Time, Difficulty Inputs ... */}
          {/* (Keep your existing inputs here) */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block font-bold text-gray-700 mb-2">Recipe Title</label>
              <input name="title" required className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-2">Cooking Time</label>
              <input name="cooking_time" required placeholder="e.g. 45 mins" className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-2">Difficulty</label>
              <select name="difficulty" className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
                <option>Chef Level</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
             <label className="block font-bold text-gray-700 mb-2">Description</label>
             <textarea name="description" required className="w-full border p-4 rounded-xl h-24 resize-none focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          {/* --- NEW SECTION: CATEGORIES --- */}
          <div className="bg-orange-50/50 p-6 rounded-2xl space-y-6 border border-orange-100">
            <TagSelector title="Cuisine Type" options={CUISINES} selected={selectedCuisine} setSelected={setSelectedCuisine} />
            <TagSelector title="Meal Type" options={MEALS} selected={selectedMeal} setSelected={setSelectedMeal} />
            <TagSelector title="Dietary (Optional)" options={DIETS} selected={selectedDiet} setSelected={setSelectedDiet} />
          </div>
          {/* ------------------------------- */}

          {/* ... Image, Ingredients, Instructions ... */}
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition">
             <input type="file" name="image" accept="image/*" id="recipe-image" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setImagePreview(URL.createObjectURL(file)) }} />
             <label htmlFor="recipe-image" className="cursor-pointer block">
               {imagePreview ? (
                 <div className="relative w-full h-64 rounded-xl overflow-hidden"><Image src={imagePreview} alt="Preview" fill className="object-cover" /></div>
               ) : (
                 <div className="flex flex-col items-center text-gray-500 py-8"><Upload size={32} className="mb-2" /><span>Click to upload photo</span></div>
               )}
             </label>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h3>
            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2">
                  <input value={ing} onChange={(e) => handleArrayChange(index, e.target.value, setIngredients, ingredients)} placeholder={`Ingredient ${index + 1}`} className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required />
                  {ingredients.length > 1 && <button type="button" onClick={() => removeField(index, setIngredients, ingredients)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg"><Minus size={20} /></button>}
                </div>
              ))}
              <button type="button" onClick={() => addField(setIngredients, ingredients)} className="flex items-center gap-2 text-orange-600 font-bold mt-2 hover:bg-orange-50 px-4 py-2 rounded-lg transition"><Plus size={18} /> Add Ingredient</button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Instructions</h3>
            <div className="space-y-3">
              {instructions.map((step, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="mt-4 font-bold text-gray-400 w-6">{index + 1}.</span>
                  <textarea value={step} onChange={(e) => handleArrayChange(index, e.target.value, setInstructions, instructions)} placeholder={`Step ${index + 1}`} className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none" rows={2} required />
                  {instructions.length > 1 && <button type="button" onClick={() => removeField(index, setInstructions, instructions)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg mt-1"><Minus size={20} /></button>}
                </div>
              ))}
              <button type="button" onClick={() => addField(setInstructions, instructions)} className="flex items-center gap-2 text-orange-600 font-bold mt-2 hover:bg-orange-50 px-4 py-2 rounded-lg transition"><Plus size={18} /> Add Step</button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <ChefHat />} Publish Recipe
          </button>

        </form>
      </div>
    </div>
  )
}