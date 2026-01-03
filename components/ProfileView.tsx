'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import RecipeCard from '@/components/RecipeCard'
import RecipeModal from '@/components/RecipeModal'
import FollowListModal from '@/components/FollowListModal'
import { Settings, Share2, User, Grid, Heart, Bookmark } from 'lucide-react'
import { toggleFollow } from '@/app/actions/interactionActions'

interface ProfileViewProps {
  user: any
  currentUserId?: string
  myRecipes: any[]
  savedRecipes: any[]
  likedRecipes: any[]
  totalLikesReceived: number
  followersCount: number
  followingCount: number
  isFollowingInitial?: boolean
}

export default function ProfileView({ 
  user, 
  currentUserId,
  myRecipes, 
  savedRecipes, 
  likedRecipes, 
  totalLikesReceived,
  followersCount,
  followingCount,
  isFollowingInitial = false
}: ProfileViewProps) {
  
  const [activeTab, setActiveTab] = useState<'recipes' | 'favourites' | 'liked'>('recipes')
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  
  const [isFollowing, setIsFollowing] = useState(isFollowingInitial)
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null)

  const isMyProfile = currentUserId === user.id

  const handleFollow = async () => {
    if (!currentUserId) return alert("Please login")
    setIsFollowing(!isFollowing)
    await toggleFollow(user.id)
  }

  const content = {
    recipes: myRecipes,
    favourites: savedRecipes,
    liked: likedRecipes
  }[activeTab]

  return (
    <div className="w-full max-w-7xl mx-auto pt-8 pb-20 px-6 md:px-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10">
        <div className="relative w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-sm flex-shrink-0 bg-gray-100">
          {user.avatar_url ? (
            <Image src={user.avatar_url} alt={user.username} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={48} /></div>
          )}
        </div>

        <div className="flex-1 min-w-0 pt-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.username || 'Chef'}</h1>
          <p className="text-gray-500 text-sm mb-5">@{user.email?.split('@')[0]}</p>

          <div className="flex gap-3 mb-6 relative z-10">
            {isMyProfile ? (
              <Link href="/profile/edit" className="px-6 py-2.5 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition">
                Edit profile
              </Link>
            ) : (
              <button 
                onClick={handleFollow}
                className={`px-8 py-2.5 font-bold rounded-lg transition ${isFollowing ? 'bg-gray-100 text-gray-900 border border-gray-200' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"><Share2 size={20} /></button>
          </div>

          {/* STATS ROW */}
          <div className="flex items-center gap-8 text-gray-900">
            <button onClick={() => setFollowModal('following')} className="flex items-center gap-1.5 hover:underline cursor-pointer">
              <span className="font-bold text-xl">{followingCount}</span>
              <span className="text-gray-500">Following</span>
            </button>
            <button onClick={() => setFollowModal('followers')} className="flex items-center gap-1.5 hover:underline cursor-pointer">
              <span className="font-bold text-xl">{followersCount}</span>
              <span className="text-gray-500">Followers</span>
            </button>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl">{totalLikesReceived}</span>
              <span className="text-gray-500">Likes</span>
            </div>
          </div>

          <p className="mt-5 text-gray-700 whitespace-pre-wrap max-w-2xl leading-relaxed">{user.bio || "No bio yet."}</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-10 border-t border-gray-200 mb-8">
        <button onClick={() => setActiveTab('recipes')} className={`flex items-center gap-2 py-4 relative transition-colors ${activeTab === 'recipes' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
          <Grid size={18} /><span className="font-bold text-xs uppercase tracking-widest">Recipes</span>
          {activeTab === 'recipes' && <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-900"></div>}
        </button>
        {isMyProfile && (
          <>
            <button onClick={() => setActiveTab('favourites')} className={`flex items-center gap-2 py-4 relative transition-colors ${activeTab === 'favourites' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
              <Bookmark size={18} /><span className="font-bold text-xs uppercase tracking-widest">Saved</span>
              {activeTab === 'favourites' && <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-900"></div>}
            </button>
            <button onClick={() => setActiveTab('liked')} className={`flex items-center gap-2 py-4 relative transition-colors ${activeTab === 'liked' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
              <Heart size={18} /><span className="font-bold text-xs uppercase tracking-widest">Liked</span>
              {activeTab === 'liked' && <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-900"></div>}
            </button>
          </>
        )}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {content?.map((recipe: any) => (
          <RecipeCard 
            key={recipe.id}
            id={recipe.id}
            title={recipe.title}
            description={recipe.description}
            image={recipe.image_url} 
            time={recipe.cooking_time}
            views={0}
            author={recipe.users?.username || user.username}
            authorAvatar={recipe.users?.avatar_url || user.avatar_url}
            cuisine={recipe.cuisine}
            mealType={recipe.meal_type}
            dietary={recipe.dietary}
            userId={recipe.user_id}
            currentUserId={currentUserId}
            onExpand={() => setSelectedRecipe(recipe)}
          />
        ))}
      </div>

      {/* MODALS */}
      {selectedRecipe && <RecipeModal recipe={selectedRecipe} isOpen={!!selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
      
      {followModal && <FollowListModal userId={user.id} type={followModal} onClose={() => setFollowModal(null)} />}

    </div>
  )
}
