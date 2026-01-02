'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ArrowUpRight, User, MoreHorizontal, Trash2, Edit } from 'lucide-react'
import { deleteRecipeAction } from '@/app/actions/recipeActions'
import { useRouter } from 'next/navigation'

interface RecipeCardProps {
  id: string
  title: string
  description: string
  image: string
  time: string
  views: number
  author?: string
  authorAvatar?: string
  userId: string // The ID of the recipe owner
  currentUserId?: string // The ID of the logged-in user
  onExpand?: () => void
}

export default function RecipeCard({ 
  id, title, description, image, time, views, 
  author, authorAvatar, userId, currentUserId, onExpand 
}: RecipeCardProps) {
  
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const isOwner = currentUserId === userId

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation() // Stop card click
    if (!confirm('Are you sure you want to delete this recipe?')) return

    setIsDeleting(true)
    const result = await deleteRecipeAction(id)
    setIsDeleting(false)

    if (result.success) {
      // Optional: Force a refresh if revalidatePath doesn't hit immediately
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  return (
    <div 
      onClick={onExpand}
      className="bg-white p-3 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100 cursor-pointer relative"
    >
      
      {/* Image Container */}
      <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-3">
        <Image 
          src={image || '/placeholder-food.jpg'} 
          alt={title} 
          fill 
          className="object-cover group-hover:scale-105 transition duration-500" 
        />
        
        {/* Like Button */}
        <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition z-10">
          <Heart size={20} />
        </button>

        {/* --- 3 DOTS MENU (Only show if owner) --- */}
        {isOwner && (
          <div className="absolute top-3 left-3 z-20">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-gray-100 text-gray-700 transition shadow-sm"
            >
              <MoreHorizontal size={20} />
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <Link 
                  href={`/recipe/${id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                >
                  <Edit size={14} /> Edit
                </Link>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition text-left"
                >
                  <Trash2 size={14} /> {isDeleting ? '...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-2 pb-2 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1 leading-tight">{title}</h3>
        <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-grow">{description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 gap-3">
                  <div className="flex items-center gap-2 mb-2 min-w-0">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
            {authorAvatar ? (
              <Image src={authorAvatar} alt={author || "Chef"} fill className="object-cover" />
            ) : (
              <User className="w-full h-full p-1 text-gray-400" />
            )}
          </div>
          <span className="text-sm font-normal text-gray-600 truncate">
            {author || "Anonymous Chef"}
          </span>
        </div>
          <Link 
            href={`/recipe/${id}`}
            onClick={(e) => e.stopPropagation()} 
            className="flex-shrink-0 flex items-center gap-1 bg-black text-white px-4 py-2 rounded-full text-sm font-normal hover:bg-orange-600 transition ml-auto"
          >
            Try Recipe <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}