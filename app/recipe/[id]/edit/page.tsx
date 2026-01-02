'use client'

import { updateRecipeAction } from '@/app/actions/recipeActions'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Minus, Upload, Loader2, Save, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function EditRecipe() {
  const [ingredients, setIngredients] = useState<string[]>([''])
  const [instructions, setInstructions] = useState<string[]>([''])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true) // Start loading while fetching data
  const [saving, setSaving] = useState(false)
  const [defaultData, setDefaultData] = useState<any>(null)
  
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

      // Set State with DB Data
      setDefaultData(data)
      setIngredients(Array.isArray(data.ingredients) ? data.ingredients : JSON.parse(data.ingredients))
      setInstructions(Array.isArray(data.instructions) ? data.instructions : JSON.parse(data.instructions))
      setImagePreview(data.image_url)
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

  // 2. Handle Update
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)

    const cleanIngredients = ingredients.filter(i => i.trim() !== '')
    const cleanInstructions = instructions.filter(i => i.trim() !== '')

    formData.set('ingredients', JSON.stringify(cleanIngredients))
    formData.set('instructions', JSON.stringify(cleanInstructions))

    const result = await updateRecipeAction(recipeId, formData)

    if (result?.error) {
      alert(result.error)
      setSaving(false)
    } else {
      // Success
      router.push(`/recipe/${recipeId}`)
      router.refresh()
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#FDF8F0] p-6 flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl border border-orange-100 p-8 md:p-12">
        
        <Link href={`/recipe/${recipeId}`} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-orange-600">
           <ArrowLeft size={20} /> Cancel
        </Link>

        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Recipe</h1>
          <p className="text-gray-500">Update your recipe details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block font-bold text-gray-700 mb-2">Recipe Title</label>
              <input name="title" defaultValue={defaultData.title} required className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            
            <div>
              <label className="block font-bold text-gray-700 mb-2">Cooking Time</label>
              <input name="cooking_time" defaultValue={defaultData.cooking_time} required className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Difficulty</label>
              <select name="difficulty" defaultValue={defaultData.difficulty} className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
                <option>Chef Level</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
             <label className="block font-bold text-gray-700 mb-2">Description</label>
             <textarea name="description" defaultValue={defaultData.description} required className="w-full border p-4 rounded-xl h-24 resize-none focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition relative">
             <input 
               type="file" 
               name="image" 
               accept="image/*" 
               id="recipe-image" 
               className="hidden" 
               onChange={(e) => {
                 const file = e.target.files?.[0]
                 if (file) setImagePreview(URL.createObjectURL(file))
               }} 
             />
             <label htmlFor="recipe-image" className="cursor-pointer block">
               {imagePreview ? (
                 <div className="relative w-full h-64 rounded-xl overflow-hidden group">
                   <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <p className="text-white font-bold flex items-center gap-2"><Upload size={20}/> Change Image</p>
                   </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center text-gray-500 py-8">
                   <Upload size={32} className="mb-2" />
                   <span>Click to upload a cover photo</span>
                 </div>
               )}
             </label>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h3>
            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2">
                  <input 
                    value={ing}
                    onChange={(e) => handleArrayChange(index, e.target.value, setIngredients, ingredients)}
                    className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  />
                  {ingredients.length > 1 && (
                    <button type="button" onClick={() => removeField(index, setIngredients, ingredients)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg">
                      <Minus size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addField(setIngredients, ingredients)} className="flex items-center gap-2 text-orange-600 font-bold mt-2 hover:bg-orange-50 px-4 py-2 rounded-lg transition">
                <Plus size={18} /> Add Ingredient
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Instructions</h3>
            <div className="space-y-3">
              {instructions.map((step, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="mt-4 font-bold text-gray-400 w-6">{index + 1}.</span>
                  <textarea 
                    value={step}
                    onChange={(e) => handleArrayChange(index, e.target.value, setInstructions, instructions)}
                    className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    rows={2}
                    required
                  />
                  {instructions.length > 1 && (
                    <button type="button" onClick={() => removeField(index, setInstructions, instructions)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg mt-1">
                      <Minus size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addField(setInstructions, instructions)} className="flex items-center gap-2 text-orange-600 font-bold mt-2 hover:bg-orange-50 px-4 py-2 rounded-lg transition">
                <Plus size={18} /> Add Step
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition flex justify-center items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            Save Changes
          </button>

        </form>
      </div>
    </div>
  )
}