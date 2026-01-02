'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Heart, MessageCircle, Bookmark, Share2, Send, MoreHorizontal, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { postComment } from '@/app/actions/commentActions'
import { formatDistanceToNow } from 'date-fns' // You might need to install date-fns: npm install date-fns

interface RecipeModalProps {
  recipe: any
  isOpen: boolean
  onClose: () => void
}

export default function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

// Prevent scrolling on the body when modal is open
  useEffect(() => {
    if (isOpen) {
      // 1. Lock scroll when modal opens
      document.body.style.overflow = 'hidden'
      fetchComments()
    }

    // 2. CLEANUP FUNCTION: This runs automatically when the modal closes or unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, users(username, avatar_url)')
      .eq('recipe_id', recipe.id)
      .order('created_at', { ascending: false })
    
    if (data) setComments(data)
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    
    setLoading(true)
    const formData = new FormData()
    formData.append('recipeId', recipe.id)
    formData.append('content', newComment)

    await postComment(formData)
    setNewComment('')
    fetchComments() // Refresh comments immediately
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Close Button */}
      <button onClick={onClose} className="absolute top-6 right-6 text-white hover:opacity-75 z-50">
        <X size={32} />
      </button>

      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
        
        {/* LEFT SIDE: Image */}
        <div className="w-full md:w-[60%] bg-black relative flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image 
              src={recipe.image_url || '/placeholder-food.jpg'} 
              alt={recipe.title} 
              fill 
              className="object-contain" // Ensures image isn't cropped weirdly
            />
          </div>
        </div>

        {/* RIGHT SIDE: Content */}
        <div className="w-full md:w-[40%] flex flex-col h-full bg-white">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 relative overflow-hidden">
                {recipe.users?.avatar_url ? (
                  <Image src={recipe.users.avatar_url} alt="User" fill className="object-cover" />
                ) : (
                  <User className="p-2 w-full h-full text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{recipe.users?.username || 'Chef'}</p>
                <p className="text-xs text-gray-500">Original Recipe</p>
              </div>
            </div>
            <button className="bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-orange-600 transition">
              Follow
            </button>
          </div>

          {/* Scrollable Area: Description & Comments */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            
            {/* Caption */}
            <div className="mb-6">
                <h2 className="font-bold text-xl mb-2">{recipe.title}</h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {recipe.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs text-blue-500 font-medium">#Sedapify</span>
                    <span className="text-xs text-blue-500 font-medium">#MasakanPanas</span>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2 mb-2">Comments ({comments.length})</h3>
              
              {comments.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">No comments yet. Be the first!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-gray-100 relative overflow-hidden flex-shrink-0">
                      {comment.users?.avatar_url ? (
                         <Image src={comment.users.avatar_url} alt="User" fill className="object-cover" />
                      ) : (
                         <User className="p-1.5 w-full h-full text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-bold mr-2">{comment.users?.username || 'User'}</span>
                        <span className="text-gray-700">{comment.content}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer: Actions & Input */}
          <div className="border-t border-gray-100 bg-white">
            
            {/* Actions Bar */}
            <div className="p-4 pb-2 flex items-center justify-between">
               <div className="flex items-center gap-4 text-gray-700">
                  <button className="hover:text-red-500 transition"><Heart size={26} /></button>
                  <button className="hover:text-blue-500 transition"><MessageCircle size={26} /></button>
                  <button className="hover:text-orange-500 transition"><Share2 size={26} /></button>
               </div>
               <Link 
                  href={`/recipe/${recipe.id}`}
                  className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition"
                >
                  Try Recipe
               </Link>
            </div>
            <div className="px-4 pb-2 text-sm font-bold text-gray-900">123 likes</div>
            <div className="px-4 pb-4 text-xs text-gray-400 uppercase">{recipe.created_at?.split('T')[0]}</div>

            {/* Input */}
            <form onSubmit={handlePostComment} className="border-t border-gray-100 p-3 flex items-center gap-2 bg-gray-50">
              <div className="text-2xl cursor-pointer hover:scale-110 transition">😊</div>
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
              />
              <button 
                type="submit" 
                disabled={loading || !newComment.trim()}
                className="text-blue-500 font-bold text-sm disabled:opacity-50 hover:text-blue-600"
              >
                Post
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}