'use client'

import { useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

export default function DietaryGuard({ 
  userPref, 
  recipeType, 
  children 
}: { 
  userPref: string, 
  recipeType: string, 
  children: React.ReactNode 
}) {
  // LOGIC: Check for conflict
  // Conflict if User is Vegetarian but Recipe is NOT Vegetarian or Vegan
  const isConflict = 
    (userPref === 'Vegetarian' && recipeType !== 'Vegetarian' && recipeType !== 'Vegan') ||
    (userPref === 'Vegan' && recipeType !== 'Vegan') ||
    (userPref === 'Halal' && recipeType === 'Non-Halal');

  const [acknowledged, setAcknowledged] = useState(false)

  // 1. IF NO CONFLICT, JUST SHOW CONTENT
  if (!isConflict || acknowledged) {
    return <>{children}</>
  }

  // 2. IF CONFLICT, SHOW WARNING (BLOCKER)
  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Blurred Background Content (Optional visual effect) */}
      <div className="filter blur-xl opacity-20 pointer-events-none h-screen overflow-hidden">
        {children}
      </div>

      {/* The Safety Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-6 z-50">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-2xl border-2 border-red-100 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                <AlertTriangle size={40} />
            </div>
            
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Dietary Conflict Detected</h2>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">User Preference:</p>
                <p className="font-bold text-green-700 flex items-center gap-2 mb-3">
                    <ShieldCheck size={16} /> {userPref}
                </p>
                <div className="h-px bg-gray-200 mb-3"></div>
                <p className="text-sm text-gray-500 mb-1">Recipe Category:</p>
                <p className="font-bold text-red-600 flex items-center gap-2">
                    <AlertTriangle size={16} /> {recipeType || "Uncategorized"}
                </p>
            </div>

            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                This recipe contains ingredients that conflict with your set dietary profile. 
                Proceeding is not recommended.
            </p>

            <div className="flex flex-col gap-3">
                <a href="/" className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition">
                    Go Back to Safety
                </a>
                <button 
                    onClick={() => setAcknowledged(true)} 
                    className="text-gray-400 text-xs font-semibold hover:text-red-500 transition mt-2 underline"
                >
                    I understand the risks, show recipe
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}