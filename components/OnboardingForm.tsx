'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/app/actions/userActions'
import { ArrowRight, ChefHat, Loader2 } from 'lucide-react'

export default function OnboardingForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Stop default reload
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // Call Server Action
    const result = await completeOnboarding(formData)

    if (result?.error) {
        alert("Error: " + result.error)
        setLoading(false)
    } else {
        // Success is handled by the redirect in the action, 
        // but just in case:
        setLoading(false)
    }
  }

  return (
    <div className="bg-white max-w-lg w-full p-8 md:p-12 rounded-3xl shadow-xl border border-orange-100">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
            <ChefHat size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Sedapify!</h1>
          <p className="text-gray-500">Let's personalize your cookbook experience.</p>
        </div>

        {/* Use onSubmit here */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Username */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">What should we call you?</label>
            <input name="username" required placeholder="e.g. Chef Azim" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          {/* Dietary Preference */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Dietary Preference</label>
            <select name="dietary_pref" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none appearance-none">
                <option value="Standard">Standard (I eat everything)</option>
                <option value="Halal">Halal</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
            </select>
            <p className="text-xs text-gray-400 mt-2">We will warn you if a recipe conflicts with this.</p>
          </div>

          {/* Cooking Level */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Cooking Skill</label>
            <div className="grid grid-cols-3 gap-3">
                <label className="cursor-pointer">
                    <input type="radio" name="cooking_level" value="Beginner" className="peer sr-only" defaultChecked />
                    <div className="p-3 text-center rounded-xl border border-gray-200 peer-checked:bg-orange-500 peer-checked:text-white peer-checked:border-orange-500 transition hover:bg-gray-50">
                        Beginner
                    </div>
                </label>
                <label className="cursor-pointer">
                    <input type="radio" name="cooking_level" value="Intermediate" className="peer sr-only" />
                    <div className="p-3 text-center rounded-xl border border-gray-200 peer-checked:bg-orange-500 peer-checked:text-white peer-checked:border-orange-500 transition hover:bg-gray-50">
                        Home Cook
                    </div>
                </label>
                <label className="cursor-pointer">
                    <input type="radio" name="cooking_level" value="Master" className="peer sr-only" />
                    <div className="p-3 text-center rounded-xl border border-gray-200 peer-checked:bg-orange-500 peer-checked:text-white peer-checked:border-orange-500 transition hover:bg-gray-50">
                        Pro Chef
                    </div>
                </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition flex justify-center items-center gap-2 disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin" /> : <><span className="mr-1">Start Cooking</span> <ArrowRight size={20} /></>}
          </button>

        </form>
      </div>
  )
}