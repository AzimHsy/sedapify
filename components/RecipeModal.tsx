'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Heart, MessageCircle, Bookmark, Send, User } from 'lucide-react' // Removed Share2, kept Bookmark
import { createClient } from '@/lib/supabase/client'
import { postComment } from '@/app/actions/commentActions'
import { toggleLike, toggleSave, toggleFollow } from '@/app/actions/interactionActions'
import { formatDistanceToNow } from 'date-fns'

interface RecipeModalProps {
  recipe: any
  isOpen: boolean
  onClose: () => void
}

export default function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Interaction States
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      fetchComments()
      checkInteractions()
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fetch initial state (Did I like/save/follow this?)
  const checkInteractions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUser(user.id)

    // Check Like
    const { data: likeData } = await supabase
      .from('likes').select().eq('user_id', user.id).eq('recipe_id', recipe.id).single()
    setIsLiked(!!likeData)

    // Check Save
    const { data: saveData } = await supabase
      .from('saved_recipes').select().eq('user_id', user.id).eq('recipe_id', recipe.id).single()
    setIsSaved(!!saveData)

    // Check Follow (Target is recipe.user_id)
    if (recipe.user_id) {
      const { data: followData } = await supabase
        .from('follows').select().eq('follower_id', user.id).eq('following_id', recipe.user_id).single()
      setIsFollowing(!!followData)
    }

    // Get live like count
    const { count } = await supabase
      .from('likes').select('*', { count: 'exact', head: true }).eq('recipe_id', recipe.id)
    setLikeCount(count || 0)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, users(username, avatar_url)')
      .eq('recipe_id', recipe.id)
      .order('created_at', { ascending: false })
    if (data) setComments(data)
  }

  // --- HANDLERS ---
  const handleLike = async () => {
    if (!currentUser) return alert('Please login')
    // Optimistic Update
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    await toggleLike(recipe.id)
  }

  const handleSave = async () => {
    if (!currentUser) return alert('Please login')
    setIsSaved(!isSaved)
    await toggleSave(recipe.id)
  }

  const handleFollow = async () => {
    if (!currentUser) return alert('Please login')
    setIsFollowing(!isFollowing)
    await toggleFollow(recipe.user_id)
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
    fetchComments()
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <button onClick={onClose} className="absolute top-6 right-6 text-white hover:opacity-75 z-50">
        <X size={32} />
      </button>

      <div className="bg-white w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
        {/* LEFT SIDE: Image */}
        <div className="w-full md:w-[60%] bg-black relative flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image src={recipe.image_url || '/placeholder-food.jpg'} alt={recipe.title} fill className="object-contain" />
          </div>
        </div>

        {/* RIGHT SIDE: Content */}
        <div className="w-full md:w-[40%] flex p-2 flex-col h-full bg-white">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <Link href={`/profile/${recipe.user_id}`} className="flex items-center gap-3 hover:opacity-80 transition">
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
            </Link>
            
            {/* Follow Button (Hide if self) */}
            {currentUser !== recipe.user_id && (
              <button 
                onClick={handleFollow}
                className={`text-sm font-normal px-8 py-2 rounded-full transition ${
                  isFollowing 
                    ? 'bg-gray-100 text-gray-900 border border-gray-200' 
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Comments Area */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="mb-6">
                <div className="flex flex-wrap gap-2 mt-4 mb-4">
               {recipe.cuisine && (
                 <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">{recipe.cuisine}</span>
               )}
               {recipe.meal_type && (
                 <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">{recipe.meal_type}</span>
               )}
               {recipe.dietary && (
                 <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full">{recipe.dietary}</span>
               )}
            </div>
                <h2 className="font-bold text-xl mb-2">{recipe.title}</h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{recipe.description}</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-400 pb-2 mb-2">Comments ({comments.length})</h3>
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 items-start">
                   {/* Comment Item UI (Same as before) */}
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
                        {comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : 'Just now'}
                      </p>
                    </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 bg-white">
            <div className="p-4 pb-2 flex items-center justify-between">
               <div className="flex items-center gap-4 text-gray-700">
                  {/* LIKE BUTTON */}
                  <button onClick={handleLike} className={`transition ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
                    <Heart size={26} fill={isLiked ? "currentColor" : "none"} />
                  </button>
                  
                  <button className="hover:text-blue-500 transition"><MessageCircle size={26} /></button>
                  
                  {/* SAVE BUTTON (Replaced Share) */}
                  <button onClick={handleSave} className={`transition ${isSaved ? 'text-orange-500' : 'hover:text-orange-500'}`}>
                    <Bookmark size={26} fill={isSaved ? "currentColor" : "none"} />
                  </button>
               </div>
               <Link 
                  href={`/recipe/${recipe.id}`}
                  className="flex items-center gap-1 bg-black text-white px-8 py-3 rounded-full text-sm font-normal hover:bg-gray-800 transition"
                >
                  Try Recipe
               </Link>
            </div>
            <div className="px-4 pb-2 text-sm font-bold text-gray-900">{likeCount} likes</div>
            <div className="px-4 pb-4 text-xs text-gray-400 uppercase">{recipe.created_at?.split('T')[0]}</div>

            {/* Comment Input (Same as before) */}
            <form onSubmit={handlePostComment} className="border-t border-gray-100 p-3 flex items-center gap-2 bg-gray-50">
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
              />
              <button type="submit" disabled={loading} className="text-blue-500 font-bold text-sm">Post</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}