'use client'

import { updateRecipeAction } from '@/app/actions/recipeActions'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Minus, Upload, Loader2, Save, ArrowLeft, ChefHat, Clock, Flame, Image as ImageIcon, List, BookOpen, Tag, Mic } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { SmartInput, SmartTextarea } from '@/components/SmartInputs' // <--- IMPORT THIS

// DEFINITIONS
const CUISINES = ["Malaysian", "Western", "Chinese", "Korean", "Japanese", "Indian", "Fusion"]
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"]
const DIETS = ["Halal", "Vegetarian", "Vegan", "Low-carb", "High-protein"]

export default function EditRecipe() {
  // Existing States
  const [ingredients, setIngredients] = useState<string[]>([''])
  const [instructions, setInstructions] = useState<string[]>([''])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [defaultData, setDefaultData] = useState<any>(null)
  
  // Tag States
  const [selectedCuisine, setSelectedCuisine] = useState("")
  const [selectedMeal, setSelectedMeal] = useState("")
  const [selectedDiet, setSelectedDiet] = useState("")
  
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const recipeId = params.id as string

  // 1. Fetch Existing Data
  useEffect(() => {
    const fetchRecipe = async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single()

      if (error || !data) {
        alert('Recipe not found')
        router.push('/')
        return
      }

      setDefaultData(data)
      setIngredients(Array.isArray(data.ingredients) ? data.ingredients : JSON.parse(data.ingredients))
      setInstructions(Array.isArray(data.instructions) ? data.instructions : JSON.parse(data.instructions))
      setImagePreview(data.image_url)
      
      // LOAD EXISTING TAGS
      setSelectedCuisine(data.cuisine || "")
      setSelectedMeal(data.meal_type || "")
      setSelectedDiet(data.dietary || "")

      setLoading(false)
    }
    fetchRecipe()
  }, [recipeId, router, supabase])

  // Helper functions
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
    setSaving(true)
    const formData = new FormData(e.currentTarget)

    const cleanIngredients = ingredients.filter(i => i.trim() !== '')
    const cleanInstructions = instructions.filter(i => i.trim() !== '')

    formData.set('ingredients', JSON.stringify(cleanIngredients))
    formData.set('instructions', JSON.stringify(cleanInstructions))

    formData.set('cuisine', selectedCuisine)
    formData.set('meal_type', selectedMeal)
    formData.set('dietary', selectedDiet)

    const result = await updateRecipeAction(recipeId, formData)

    if (result?.error) {
      alert(result.error)
      setSaving(false)
    } else {
      router.push(`/recipe/${recipeId}`)
      router.refresh()
    }
  }

  // Tag Component
  const TagSelector = ({ title, options, selected, setSelected, icon: Icon }: any) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-orange-600" />}
        <label className="block font-bold text-gray-800">{title}</label>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => {
          const isSelected = selected === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setSelected(isSelected ? "" : opt)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                isSelected
                  ? "bg-orange-500 text-white border-orange-500 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
              }`}
              suppressHydrationWarning
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto mb-4 text-orange-600" size={48} />
        <p className="text-gray-600 font-medium">Loading recipe...</p>
      </div>
    </div>
  )

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30"
      style={{ 
        paddingTop: '3rem', 
        paddingBottom: '3rem',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}
    >
      <div className="max-w-5xl mx-auto">
        
        {/* BACK BUTTON */}
        <Link 
          href={`/recipe/${recipeId}`} 
          className="inline-flex items-center gap-2 text-gray-600 mb-6 hover:text-orange-600 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Back to Recipe
        </Link>

        {/* HERO HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-xs font-bold mb-4">
             <Mic size={14} /> Voice Input Available
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Edit Your Recipe
          </h1>
          <p className="text-lg text-gray-600">
            Update your culinary masterpiece
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* CARD 1: BASIC INFO */}
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
                <input 
                  name="title" 
                  defaultValue={defaultData?.title}
                  required 
                  placeholder="e.g., Spicy Malaysian Nasi Lemak"
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Description *</label>
                <textarea 
                  name="description" 
                  defaultValue={defaultData?.description}
                  required 
                  placeholder="Share what makes this recipe special..."
                  className="w-full border-2 border-gray-200 p-4 rounded-xl h-28 resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  suppressHydrationWarning
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-orange-600" />
                    Cooking Time *
                  </label>
                  <input 
                    name="cooking_time" 
                    defaultValue={defaultData?.cooking_time}
                    required 
                    placeholder="e.g., 45 mins"
                    className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Flame size={16} className="text-orange-600" />
                    Difficulty *
                  </label>
                  <select 
                    name="difficulty" 
                    defaultValue={defaultData?.difficulty}
                    className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white cursor-pointer"
                    suppressHydrationWarning
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Chef Level</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: CATEGORIES */}
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

          {/* CARD 3: IMAGE UPLOAD */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <ImageIcon size={20} className="text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Recipe Photo</h2>
            </div>

            <div className="border-3 border-dashed border-gray-300 rounded-2xl overflow-hidden hover:border-orange-400 transition-all duration-300 group">
              <input 
                type="file" 
                name="image" 
                accept="image/*" 
                id="recipe-image" 
                className="hidden" 
                onChange={(e) => { 
                  const file = e.target.files?.[0]; 
                  if (file) setImagePreview(URL.createObjectURL(file)) 
                }} 
              />
              <label htmlFor="recipe-image" className="cursor-pointer block">
                {imagePreview ? (
                  <div className="relative w-full h-80 group">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white text-center">
                        <Upload size={32} className="mx-auto mb-2" />
                        <span className="font-semibold">Click to change photo</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500 py-16 bg-gray-50 group-hover:bg-orange-50/50 transition-colors">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={28} className="text-orange-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-700">Click to upload photo</span>
                    <span className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* CARD 4: INGREDIENTS (SmartInput) */}
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
                  
                  {/* REPLACED WITH SMART INPUT */}
                  <div className="flex-1">
                    <SmartInput 
                        value={ing} 
                        onChange={(val) => handleArrayChange(index, val, setIngredients, ingredients)} 
                        placeholder="e.g. 2 cups rice"
                        type="ingredient"
                    />
                  </div>

                  {ingredients.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeField(index, setIngredients, ingredients)} 
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      suppressHydrationWarning
                    >
                      <Minus size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => addField(setIngredients, ingredients)} 
                className="flex items-center gap-2 text-orange-600 font-bold mt-4 hover:bg-orange-50 px-5 py-3 rounded-xl transition-all border-2 border-dashed border-orange-300 w-full justify-center hover:border-orange-500"
                suppressHydrationWarning
              >
                <Plus size={18} /> Add Another Ingredient
              </button>
            </div>
          </div>

          {/* CARD 5: INSTRUCTIONS (SmartTextarea) */}
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
                  
                  {/* REPLACED WITH SMART TEXTAREA */}
                  <div className="flex-1">
                    <SmartTextarea 
                        value={step} 
                        onChange={(val) => handleArrayChange(index, val, setInstructions, instructions)} 
                        placeholder={`Describe step ${index + 1}...`}
                        type="instruction"
                    />
                  </div>

                  {instructions.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeField(index, setInstructions, instructions)} 
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all mt-1 opacity-0 group-hover:opacity-100"
                      suppressHydrationWarning
                    >
                      <Minus size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => addField(setInstructions, instructions)} 
                className="flex items-center gap-2 text-orange-600 font-bold mt-4 hover:bg-orange-50 px-5 py-3 rounded-xl transition-all border-2 border-dashed border-orange-300 w-full justify-center hover:border-orange-500"
                suppressHydrationWarning
              >
                <Plus size={18} /> Add Another Step
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={saving} 
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-5 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all flex justify-center items-center gap-3 shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            suppressHydrationWarning
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={24} />
                Save Changes
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  )
}