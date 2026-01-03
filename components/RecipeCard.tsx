'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ArrowUpRight, User, MoreHorizontal, Trash2, Edit, Bot, Sparkles } from 'lucide-react'
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
  userId: string 
  currentUserId?: string 
  cuisine?: string
  mealType?: string
  dietary?: string
  isAiGenerated?: boolean 
  onExpand?: () => void
}

export default function RecipeCard({ 
  id, title, description, image, time, views, 
  author, authorAvatar, userId, currentUserId, 
  cuisine, mealType, dietary, 
  isAiGenerated = false, 
  onExpand 
}: RecipeCardProps) {
  
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const isOwner = currentUserId === userId

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation() 
    if (!confirm('Are you sure?')) return
    setIsDeleting(true)
    const result = await deleteRecipeAction(id)
    setIsDeleting(false)
    if (result.success) router.refresh()
  }

  const authorProfileLink = isAiGenerated ? '/generate' : `/profile/${userId}`

  return (
    <div 
      onClick={onExpand}
      className={`bg-white p-3 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full border cursor-pointer relative ${isAiGenerated ? 'border-orange-200' : 'border-gray-100'}`}
    >
      {/* Image Container */}
      <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-3">
        <Image src={image || '/placeholder-food.jpg'} alt={title} fill className="object-cover group-hover:scale-105 transition duration-500" />
        
        {/* AI Badge - BOTTOM LEFT */}
        {isAiGenerated && (
            <div 
              style={{ position: 'absolute', bottom: '12px', left: '12px' }}
              className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10 border border-white/20 shadow-sm"
            >
                <Sparkles size={11} className="animate-pulse" /> AI Chef
            </div>
        )}

        {/* Heart Button - TOP RIGHT */}
        <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition z-10">
          <Heart size={20} />
        </button>
        
        {isOwner && (
          <div className="absolute top-3 left-3 z-20">
            <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }} className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-gray-100 text-gray-700 transition shadow-sm"><MoreHorizontal size={20} /></button>
            {showMenu && (
              <div className="absolute top-full left-0 mb-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <Link href={`/recipe/${id}/edit`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"><Edit size={14} /> Edit</Link>
                <button onClick={handleDelete} disabled={isDeleting} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition text-left"><Trash2 size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-2 pb-2 flex flex-col flex-grow">
        <div className="flex gap-2 mb-2 overflow-hidden">
          {cuisine && <span className="shrink-0 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{cuisine}</span>}
          {mealType && <span className="shrink-0 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{mealType}</span>}
          {dietary && <span className="shrink-0 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{dietary}</span>}
        </div>
        
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1 leading-tight">{title}</h3>
        <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-grow">{description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 gap-3">
          
          {/* AUTHOR SECTION */}
          <Link 
            href={authorProfileLink}
            onClick={(e) => e.stopPropagation()} 
            className="flex items-center gap-2 min-w-0 hover:bg-gray-50 p-1 rounded-lg transition -ml-1 w-fit"
          >
            <div className={`relative w-8 h-8 rounded-full overflow-hidden border flex-shrink-0 flex items-center justify-center ${isAiGenerated ? 'bg-orange-500 border-orange-500' : 'bg-gray-100 border-gray-200'}`}>
              
              {isAiGenerated ? (
                <Bot className="text-white" size={18} />
              ) : (
                authorAvatar ? (
                    <Image src={authorAvatar} alt={author || "Chef"} fill className="object-cover" />
                ) : (
                    <User className="p-1 text-gray-400" />
                )
              )}
            </div>
            <span className="text-sm font-normal text-gray-600 truncate hover:text-orange-600 transition">
              {isAiGenerated ? "Sedapify AI" : (author || "Anonymous")}
            </span>
          </Link>

          <Link href={`/recipe/${id}`} onClick={(e) => e.stopPropagation()} className="flex-shrink-0 flex items-center gap-1 bg-black text-white px-4 py-3 rounded-full text-sm font-normal hover:bg-orange-600 transition ml-auto">
            Try Recipe <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}