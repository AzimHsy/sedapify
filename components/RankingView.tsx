'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Crown, Heart, User, Trophy, Medal, ChevronRight } from 'lucide-react'

interface RankingViewProps {
  topUsers: any[]
  topRecipes: any[]
}

export default function RankingView({ topUsers, topRecipes }: RankingViewProps) {
  const [activeTab, setActiveTab] = useState<'chefs' | 'recipes'>('chefs')

  // Helper to render rank badges
  const renderRankBadge = (index: number) => {
    if (index === 0) return <Crown className="text-yellow-500 fill-yellow-500" size={24} /> // Gold
    if (index === 1) return <Medal className="text-gray-400 fill-gray-400" size={24} /> // Silver
    if (index === 2) return <Medal className="text-orange-700 fill-orange-700" size={24} /> // Bronze
    return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <Trophy className="text-orange-500" size={32} /> Leaderboard
        </h1>
        <p className="text-gray-500">Discover the most popular chefs and recipes.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
          <button 
            onClick={() => setActiveTab('chefs')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'chefs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Top Chefs
          </button>
          <button 
            onClick={() => setActiveTab('recipes')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'recipes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Top Recipes
          </button>
        </div>
      </div>

      {/* --- LIST VIEW --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {activeTab === 'chefs' ? (
          // CHEFS LIST
          <div>
            {topUsers.map((user, index) => (
              <Link 
                href={`/profile/${user.id}`} 
                key={user.id}
                className="flex items-center gap-4 p-5 hover:bg-orange-50 transition border-b border-gray-50 last:border-none group"
              >
                <div className="flex-shrink-0 w-8 flex justify-center">
                  {renderRankBadge(index)}
                </div>
                
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 border border-gray-100">
                  {user.avatar_url ? (
                    <Image src={user.avatar_url} alt={user.username} fill className="object-cover" />
                  ) : (
                    <User className="p-2 w-full h-full text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition">{user.username}</h3>
                  <p className="text-xs text-gray-500">@{user.email?.split('@')[0]}</p>
                </div>

                <div className="text-right">
                  <span className="block font-bold text-gray-900">{user.followers_count}</span>
                  <span className="text-xs text-gray-400">Followers</span>
                </div>
                
                <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-400" />
              </Link>
            ))}
          </div>
        ) : (
          // RECIPES LIST
          <div>
            {topRecipes.map((recipe, index) => (
              <Link 
                href={`/recipe/${recipe.id}`} 
                key={recipe.id}
                className="flex items-center gap-4 p-5 hover:bg-orange-50 transition border-b border-gray-50 last:border-none group"
              >
                <div className="flex-shrink-0 w-8 flex justify-center">
                  {renderRankBadge(index)}
                </div>

                <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-200">
                  <Image src={recipe.image_url || '/placeholder-food.jpg'} alt={recipe.title} fill className="object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate group-hover:text-orange-600 transition">{recipe.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <div className="flex items-center gap-1">
                       <User size={12} /> {recipe.users?.username || 'Unknown'}
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-1 text-red-500">
                  <Heart size={16} fill="currentColor" />
                  <span className="font-bold">{recipe.likes_count}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}