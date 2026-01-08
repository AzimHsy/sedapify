'use client'

import { useState, useEffect } from 'react'
import { Search, X, User, ChefHat, Clock, ArrowRight, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { searchGlobalAction } from '@/app/actions/searchActions'

export default function SearchDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ users: any[]; recipes: any[] } | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // 1. Load History only on client mount (Fixes hydration issues)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recent_searches')
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved))
        } catch (e) {
          console.error("Failed to parse history", e)
        }
      }
    }
  }, [])

  // 2. Save Function
  const addToHistory = (term: string) => {
    if (!term.trim()) return
    
    // Remove duplicate, add to top, limit to 8
    const newHistory = [term, ...recentSearches.filter(t => t !== term)].slice(0, 8)
    
    setRecentSearches(newHistory)
    localStorage.setItem('recent_searches', JSON.stringify(newHistory))
  }

  const removeHistory = (e: any, term: string) => {
    e.stopPropagation() // Prevent triggering the search click
    const newHistory = recentSearches.filter(t => t !== term)
    setRecentSearches(newHistory)
    localStorage.setItem('recent_searches', JSON.stringify(newHistory))
  }

  // 3. Handle Link Click
  const handleResultClick = () => {
    addToHistory(query) // Save the CURRENT query to history
    onClose() // Close drawer
  }

  // 4. Search Logic
  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      setLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchGlobalAction(query)
        setResults(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[30] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-[40] bg-white shadow-2xl transition-transform duration-300 ease-out w-full md:w-[450px] flex flex-col md:ml-[256px] border-r border-gray-100
          ${isOpen ? 'translate-x-0' : '-translate-x-[120%]' /* Push completely off screen */}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search recipes, chefs..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
              suppressHydrationWarning
              autoFocus={isOpen} 
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1">
                <X size={16} />
              </button>
            )}
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-gray-500">
             <span className="text-sm font-bold">Cancel</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          
          {loading && (
            <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
               <Loader2 className="animate-spin" size={20} /> Searching...
            </div>
          )}

          {/* SECTION: RECENT SEARCHES (Only show if NO query) */}
          {!query && (
            <div className="p-2">
              <div className="flex justify-between items-center mb-2 px-2">
                <span className="font-bold text-sm text-gray-900">Recent</span>
                {recentSearches.length > 0 && (
                  <button onClick={() => { setRecentSearches([]); localStorage.removeItem('recent_searches') }} className="text-xs text-blue-600 font-semibold hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              
              {recentSearches.length === 0 ? (
                 <div className="text-center py-12 opacity-50">
                    <Search size={48} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">No recent searches</p>
                 </div>
              ) : (
                <div className="space-y-1">
                  {recentSearches.map((term, index) => (
                    <div 
                        key={`${term}-${index}`} 
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer group transition"
                        onClick={() => setQuery(term)}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                         <div className="bg-gray-100 p-2 rounded-full text-gray-500"><Clock size={16} /></div>
                         <span className="text-gray-700 font-medium truncate">{term}</span>
                      </div>
                      <button 
                        onClick={(e) => removeHistory(e, term)} 
                        className="text-gray-300 hover:text-gray-900 p-2 rounded-full hover:bg-gray-200 transition opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION: RESULTS (Only show if Query exists) */}
          {query && results && !loading && (
            <div className="space-y-6 p-2">
              
              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Accounts</h3>
                  {results.users.map(user => (
                    <Link 
                        key={user.id} 
                        href={`/profile/${user.id}`} 
                        onClick={handleResultClick}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-200 relative overflow-hidden flex-shrink-0 border border-gray-100">
                        {user.avatar_url ? (
                          <Image src={user.avatar_url} alt="" fill className="object-cover" />
                        ) : (
                          <User className="w-full h-full p-3 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate group-hover:text-orange-600 transition">{user.username}</p>
                        <p className="text-xs text-gray-500">Chef</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Recipes */}
              {results.recipes.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 mt-2">Recipes</h3>
                  {results.recipes.map(recipe => (
                    <Link 
                        key={recipe.id} 
                        href={`/recipe/${recipe.id}`} 
                        onClick={handleResultClick}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition group"
                    >
                      <div className="w-14 h-14 rounded-lg bg-gray-200 relative overflow-hidden flex-shrink-0 border border-gray-100">
                         {recipe.image_url ? (
                           <Image src={recipe.image_url} alt="" fill className="object-cover" />
                         ) : (
                           <ChefHat className="w-full h-full p-3 text-gray-400" />
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate group-hover:text-orange-600 transition">{recipe.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                           <span>by {recipe.users?.username}</span>
                           <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                           <span>{recipe.cuisine || 'Food'}</span> 
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-500 -ml-2 opacity-0 group-hover:opacity-100 transition" />
                    </Link>
                  ))}
                </div>
              )}

              {results.users.length === 0 && results.recipes.length === 0 && (
                <div className="text-center py-16 px-4">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-900 font-bold">No results for "{query}"</p>
                    <p className="text-gray-500 text-sm">Check your spelling or try a different keyword.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}