'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import RecipeCard from '@/components/RecipeCard'
import RecipeModal from '@/components/RecipeModal' // 1. Import the Modal
import { Settings, Share2, User, Grid, Heart, Bookmark } from 'lucide-react'

interface ProfileViewProps {
  user: any
  currentUserId?: string // NEW PROP
  myRecipes: any[]
  savedRecipes: any[]
  likedRecipes: any[]
  totalLikesReceived: number
}

export default function ProfileView({ 
  user, 
  myRecipes, 
  currentUserId, // Receive it
  savedRecipes, 
  likedRecipes, 
  totalLikesReceived 
}: ProfileViewProps) {
  
  const [activeTab, setActiveTab] = useState<'recipes' | 'favourites' | 'liked'>('recipes')
  
  // 2. Add State for the Modal
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)

  const content = {
    recipes: myRecipes,
    favourites: savedRecipes,
    liked: likedRecipes
  }[activeTab]

  return (
    <div className="w-full max-w-7xl mx-auto pt-8 pb-20 px-6 md:px-10">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10">
        
        {/* Avatar */}
        <div className="relative w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-sm flex-shrink-0 bg-gray-100">
          {user.avatar_url ? (
            <Image 
              src={user.avatar_url} 
              alt={user.username} 
              fill 
              className="object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <User size={48} />
            </div>
          )}
        </div>

        {/* User Info & Stats */}
        <div className="flex-1 min-w-0 pt-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.username || 'Chef'}</h1>
          <p className="text-gray-500 text-sm mb-5">@{user.email?.split('@')[0]}</p>

          <div className="flex gap-3 mb-6 relative z-10">
            <Link 
              href="/profile/edit" 
              className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition shadow-sm"
            >
              Edit profile
            </Link>
            <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition">
              <Share2 size={20} />
            </button>
            <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition">
              <Settings size={20} />
            </button>
          </div>

          <div className="flex items-center gap-8 text-gray-900">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl">0</span>
              <span className="text-gray-500">Following</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl">0</span>
              <span className="text-gray-500">Followers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl">{totalLikesReceived}</span>
              <span className="text-gray-500">Likes</span>
            </div>
          </div>

          <p className="mt-5 text-gray-700 whitespace-pre-wrap max-w-2xl leading-relaxed">
            {user.bio || "No bio yet."}
          </p>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="flex items-center gap-10 border-t border-gray-200 mb-8">
        <button 
          onClick={() => setActiveTab('recipes')}
          className={`flex items-center gap-2 py-4 relative transition-colors ${
            activeTab === 'recipes' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Grid size={18} />
          <span className="font-bold text-xs uppercase tracking-widest">Your Recipes</span>
          {activeTab === 'recipes' && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-900"></div>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('favourites')}
          className={`flex items-center gap-2 py-4 relative transition-colors ${
            activeTab === 'favourites' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Bookmark size={18} />
          <span className="font-bold text-xs uppercase tracking-widest">Favourites</span>
          {activeTab === 'favourites' && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-900"></div>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('liked')}
          className={`flex items-center gap-2 py-4 relative transition-colors ${
            activeTab === 'liked' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Heart size={18} />
          <span className="font-bold text-xs uppercase tracking-widest">Liked</span>
          {activeTab === 'liked' && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-900"></div>
          )}
        </button>
      </div>

      {/* --- GRID CONTENT --- */}
      {content.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {content.map((recipe: any) => (
             <RecipeCard 
      key={recipe.id}
      id={recipe.id}
      title={recipe.title}
      description={recipe.description}  
      image={recipe.image_url || '/placeholder-food.jpg'} 
      time={recipe.cooking_time}
      views={0}
      author={recipe.users?.username || user.username}
      authorAvatar={recipe.users?.avatar_url || user.avatar_url}
      // Pass IDs
      userId={recipe.user_id}
      currentUserId={currentUserId}
      onExpand={() => setSelectedRecipe(recipe)}
    />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="bg-white p-6 rounded-full mb-4 shadow-sm">
            {activeTab === 'recipes' && <Grid size={32} className="text-gray-300" />}
            {activeTab === 'favourites' && <Bookmark size={32} className="text-gray-300" />}
            {activeTab === 'liked' && <Heart size={32} className="text-gray-300" />}
          </div>
          <p className="font-bold text-lg text-gray-900 mb-1">No recipes yet</p>
          <p className="text-sm">
            {activeTab === 'recipes' ? "Share your culinary masterpieces with the world." : "Interact with posts to see them here."}
          </p>
        </div>
      )}

      {/* 4. Render the Modal when a recipe is selected */}
      {selectedRecipe && (
        <RecipeModal 
          recipe={selectedRecipe} 
          isOpen={!!selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}

    </div>
  )
}