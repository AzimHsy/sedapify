'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trophy, Medal, Crown, Users, ChefHat, TrendingUp, Flame, Heart, User as UserIcon, ChevronRight } from 'lucide-react'

interface RankingViewProps {
  topUsers: any[]
  topRecipes: any[]
}

export default function RankingView({ topUsers, topRecipes }: RankingViewProps) {
  const [activeTab, setActiveTab] = useState<'chefs' | 'recipes'>('chefs')

  // Helper to render rank badges
  const renderRankBadge = (index: number) => {
    if (index === 0) return <Crown className="text-yellow-500 fill-yellow-500" size={24} />
    if (index === 1) return <Medal className="text-gray-400 fill-gray-400" size={24} />
    if (index === 2) return <Medal className="text-orange-700 fill-orange-700" size={24} />
    return <span className="font-bold text-gray-600 w-6 text-center">{index + 1}</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-[#FDF8F0] to-orange-50/30">
      
      {/* Hero Header */}
      <div className="bg-[url('/rank-bg.jpg')] bg-cover bg-center bg-no-repeat text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-xl">
            <Trophy size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Leaderboard</h1>
          <p className="text-xl text-orange-50 max-w-2xl mx-auto">
            Discover the top chefs and most loved recipes in the Sedapify community
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('chefs')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'chefs'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={20} />
            Top Chefs
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'recipes'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ChefHat size={20} />
            Top Recipes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            {activeTab === 'chefs' ? (
              <TrendingUp size={24} className="text-orange-600" />
            ) : (
              <Flame size={24} className="text-orange-600" />
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {activeTab === 'chefs' ? 'Top Chefs' : 'Top Recipes'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'chefs' 
                ? 'Most followed creators this month' 
                : 'Most loved dishes this month'}
            </p>
          </div>
        </div>

        {/* Rankings List */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          {activeTab === 'chefs' ? (
            // CHEFS LIST
            <div>
              {topUsers && topUsers.length > 0 ? (
                topUsers.map((user, index) => (
                  <Link 
                    href={`/profile/${user.id}`} 
                    key={user.id}
                    className={`flex items-center gap-4 p-5 hover:bg-orange-50 transition border-b border-gray-100 last:border-none group ${
                      index < 3 ? 'bg-gradient-to-r from-orange-50/30 to-transparent' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 flex justify-center">
                      {renderRankBadge(index)}
                    </div>
                    
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-md">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt={user.username} fill className="object-cover" />
                      ) : (
                        <UserIcon className="p-3 w-full h-full text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition truncate">
                        {user.username}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">@{user.email?.split('@')[0]}</p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 text-orange-600 font-bold">
                        <Users size={18} />
                        <span>{user.followers_count?.toLocaleString() || 0}</span>
                      </div>
                      <span className="text-xs text-gray-500">Followers</span>
                    </div>
                    
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-orange-500 transition" />
                  </Link>
                ))
              ) : (
                <div className="text-center py-20">
                  <Trophy size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No chefs ranked yet.</p>
                </div>
              )}
            </div>
          ) : (
            // RECIPES LIST
            <div>
              {topRecipes && topRecipes.length > 0 ? (
                topRecipes.map((recipe, index) => (
                  <Link 
                    href={`/recipe/${recipe.id}`} 
                    key={recipe.id}
                    className={`flex items-center gap-4 p-5 hover:bg-orange-50 transition border-b border-gray-100 last:border-none group ${
                      index < 3 ? 'bg-gradient-to-r from-orange-50/30 to-transparent' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 flex justify-center">
                      {renderRankBadge(index)}
                    </div>

                    <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-gray-200 shadow-md border-2 border-white">
                      <Image 
                        src={recipe.image_url || '/placeholder-food.jpg'} 
                        alt={recipe.title} 
                        fill 
                        className="object-cover group-hover:scale-110 transition duration-300" 
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-orange-600 transition">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <UserIcon size={14} /> 
                        <span>{recipe.users?.username || 'Unknown Chef'}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 text-red-500 font-bold">
                        <Heart size={18} fill="currentColor" />
                        <span>{recipe.likes_count?.toLocaleString() || 0}</span>
                      </div>
                      <span className="text-xs text-gray-500">Likes</span>
                    </div>

                    <ChevronRight size={20} className="text-gray-300 group-hover:text-orange-500 transition" />
                  </Link>
                ))
              ) : (
                <div className="text-center py-20">
                  <Trophy size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No recipes ranked yet.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}