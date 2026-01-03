'use client'

import { useState } from 'react'
import { Heart, Share2 } from 'lucide-react'
import { toggleLike } from '@/app/actions/interactionActions'

interface RecipeInteractionProps {
  recipeId: string
  currentUser?: any
  initialIsLiked: boolean
}

export default function RecipeInteraction({ recipeId, currentUser, initialIsLiked }: RecipeInteractionProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)

  const handleLike = async () => {
    if (!currentUser) return alert("Please login to like recipes")
    
    // Optimistic Update (Change color immediately)
    setIsLiked(!isLiked)
    
    // Call Server Action
    await toggleLike(recipeId)
  }

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleLike}
        className={`p-2 rounded-full border transition-all ${
          isLiked 
            ? 'bg-red-50 border-red-200 text-red-500' 
            : 'border-gray-200 hover:bg-gray-100 text-gray-500'
        }`}
      >
        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
      </button>
      
      <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 transition">
        <Share2 size={20} />
      </button>
    </div>
  )
}