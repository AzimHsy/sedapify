'use client'

import { useState, useTransition } from 'react'
import { Heart, Bookmark, Share2, MessageCircle } from 'lucide-react'
import { toggleLike, toggleSave } from '@/app/actions/interactionActions'
import { useRouter } from 'next/navigation'
import RecipeModal from './RecipeModal' // <--- Import the Modal

interface RecipeInteractionProps {
  recipe: any // <--- Changed from recipeId to full recipe object
  currentUser?: any
  initialIsLiked: boolean
  initialIsSaved: boolean
}

export default function RecipeInteraction({ 
  recipe, 
  currentUser, 
  initialIsLiked,
  initialIsSaved 
}: RecipeInteractionProps) {
  
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isModalOpen, setIsModalOpen] = useState(false) // <--- State for Modal
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleLike = () => {
    if (!currentUser) return router.push('/login')
    setIsLiked(!isLiked)
    startTransition(async () => {
      await toggleLike(recipe.id)
    })
  }

  const handleSave = () => {
    if (!currentUser) return router.push('/login')
    setIsSaved(!isSaved)
    startTransition(async () => {
      await toggleSave(recipe.id)
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Link copied to clipboard!")
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Like Button */}
        <button 
          onClick={handleLike}
          disabled={isPending}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all border ${
            isLiked 
              ? 'bg-red-50 border-red-200 text-red-500' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Heart size={20} className={isLiked ? "fill-current" : ""} />
          <span>{isLiked ? "Liked" : "Like"}</span>
        </button>

        {/* --- NEW: Comment Button --- */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all border bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        
        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={isPending}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all border ${
            isSaved 
              ? 'bg-orange-50 border-orange-200 text-orange-600' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 transition"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* --- THE MODAL --- */}
      {isModalOpen && (
        <RecipeModal 
            recipe={recipe} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  )
}