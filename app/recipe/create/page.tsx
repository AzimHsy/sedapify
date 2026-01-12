'use client'

import { createManualRecipe } from '@/app/actions/userActions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Upload, Loader2, ChefHat, Clock, Flame, Image as ImageIcon, List, BookOpen, Tag, Mic } from 'lucide-react'
import Image from 'next/image'
import { SmartInput, SmartTextarea } from '@/components/SmartInputs' // <--- IMPORT HERE

// DEFINITIONS
const CUISINES = ["Malaysian", "Western", "Chinese", "Korean", "Japanese", "Indian", "Fusion"]
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"]
const DIETS = ["Halal", "Vegetarian", "Vegan", "Low-carb", "High-protein"]

export default function CreateRecipe() {
  const [ingredients, setIngredients] = useState<string[]>([''])
  const [instructions, setInstructions] = useState<string[]>([''])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [selectedCuisine, setSelectedCuisine] = useState("")
  const [selectedMeal, setSelectedMeal] = useState("")
  const [selectedDiet, setSelectedDiet] = useState("")

  const router = useRouter()

  const handleIngredientChange = (index: number, val: string) => {
    const newList = [...ingredients]
    newList[index] = val
    setIngredients(newList)
  }

  const handleInstructionChange = (index: number, val: string) => {
    const newList = [...instructions]
    newList[index] = val
    setInstructions(newList)
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

    const cleanIngredients = ingredients.filter(i => i.trim() !== '')
    const cleanInstructions = instructions.filter(i => i.trim() !== '')
    formData.set('ingredients', JSON.stringify(cleanIngredients))
    formData.set('instructions', JSON.stringify(cleanInstructions))

    formData.set('cuisine', selectedCuisine)
    formData.set('meal_type', selectedMeal)
    formData.set('dietary', selectedDiet)

    const result = await createManualRecipe(formData)
    
    if (result?.error) {
      alert(result.error)
      setLoading(false)
    } else {
      router.push('/profile')
    }
  }

  const TagSelector = ({ title, options, selected, setSelected, icon: Icon }: any) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-orange-600" />}
        <label className="block font-bold text-gray-800">{title}</label>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSelected(selected === opt ? "" : opt)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                selected === opt
                  ? "bg-orange-500 text-white border-orange-500 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {opt}
            </button>
        ))}
      </div>
    </div>
  )

  return (
      <div 
      className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30"
      style={{ paddingTop: '3rem', paddingBottom: '3rem', paddingLeft: '1rem', paddingRight: '1rem' }}
    >
      <div className="max-w-5xl mx-auto">
        
        {/* HERO HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-xs font-bold mb-4">
             <Mic size={14} /> Voice Input Available
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Share Your Recipe
          </h1>
          <p className="text-lg text-gray-600">
            Create and share your culinary masterpiece with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* BASIC INFO */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <BookOpen size={20} className="text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Recipe Title *</label>
                <input name="title" required placeholder="e.g., Spicy Nasi Lemak" className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Description *</label>
                <textarea name="description" required placeholder="Share what makes this recipe special..." className="w-full border-2 border-gray-200 p-4 rounded-xl h-28 resize-none focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Cooking Time *</label>
                  <input name="cooking_time" required placeholder="e.g., 45 mins" className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Difficulty *</label>
                  <select name="difficulty" className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Chef Level</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORIES */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Tag size={20} className="text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
            </div>
            <div className="space-y-6">
              <TagSelector title="Cuisine Type" options={CUISINES} selected={selectedCuisine} setSelected={setSelectedCuisine} />
              <TagSelector title="Meal Type" options={MEALS} selected={selectedMeal} setSelected={setSelectedMeal} />
              <TagSelector title="Dietary Preferences (Optional)" options={DIETS} selected={selectedDiet} setSelected={setSelectedDiet} />
            </div>
          </div>

          {/* IMAGE UPLOAD */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <ImageIcon size={20} className="text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Recipe Photo</h2>
            </div>
            <div className="border-3 border-dashed border-gray-300 rounded-2xl overflow-hidden hover:border-orange-400 transition-all duration-300 group relative">
              <input type="file" name="image" accept="image/*" id="recipe-image" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setImagePreview(URL.createObjectURL(file)) }} />
              <label htmlFor="recipe-image" className="cursor-pointer block">
                {imagePreview ? (
                  <div className="relative w-full h-80">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Upload size={32} /></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500 py-16 bg-gray-50 group-hover:bg-orange-50/50 transition-colors">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Upload size={28} className="text-orange-600" /></div>
                    <span className="text-lg font-semibold">Click to upload photo</span>
                  </div>
                )}
              </label>
            </div>   
          </div>

          {/* INGREDIENTS (With Smart Input) */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <List size={20} className="text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Ingredients</h2>
            </div>

            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-3 items-center group">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-orange-600 text-sm">
                    {index + 1}
                  </div>
                  
                  {/* --- SMART INPUT --- */}
                  <div className="flex-1">
                    <SmartInput 
                        value={ing} 
                        onChange={(val) => handleIngredientChange(index, val)}
                        placeholder="e.g. 2 cups rice"
                        type="ingredient"
                    />
                  </div>

                  {ingredients.length > 1 && (
                    <button type="button" onClick={() => removeField(index, setIngredients, ingredients)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Minus size={20} /></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addField(setIngredients, ingredients)} className="flex items-center gap-2 text-orange-600 font-bold mt-4 hover:bg-orange-50 px-5 py-3 rounded-xl transition-all border-2 border-dashed border-orange-300 w-full justify-center hover:border-orange-500">
                <Plus size={18} /> Add Another Ingredient
              </button>
            </div>
          </div>

          {/* INSTRUCTIONS (With Smart Textarea) */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <BookOpen size={20} className="text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Cooking Instructions</h2>
            </div>

            <div className="space-y-4">
              {instructions.map((step, index) => (
                <div key={index} className="flex gap-3 items-start group">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-orange-600 text-sm mt-2">
                    {index + 1}
                  </div>
                  
                  {/* --- SMART TEXTAREA --- */}
                  <div className="flex-1">
                    <SmartTextarea 
                        value={step}
                        onChange={(val) => handleInstructionChange(index, val)}
                        placeholder={`Describe step ${index + 1}...`}
                        type="instruction"
                    />
                  </div>

                  {instructions.length > 1 && (
                    <button type="button" onClick={() => removeField(index, setInstructions, instructions)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all mt-4 opacity-0 group-hover:opacity-100"><Minus size={20} /></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addField(setInstructions, instructions)} className="flex items-center gap-2 text-orange-600 font-bold mt-4 hover:bg-orange-50 px-5 py-3 rounded-xl transition-all border-2 border-dashed border-orange-300 w-full justify-center hover:border-orange-500">
                <Plus size={18} /> Add Another Step
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-5 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all flex justify-center items-center gap-3 shadow-xl shadow-orange-200 hover:shadow-2xl">
            {loading ? <><Loader2 className="animate-spin" size={24} /> Publishing...</> : <><ChefHat size={24} /> Publish Recipe</>}
          </button>

        </form>
      </div>
    </div>
  )
}