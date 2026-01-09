'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  Home, Compass, ShoppingBasket, Trophy, 
  BookOpen, PlusSquare, LogOut, User, 
  ChevronDown, ChevronUp,
  PlaySquare, Search, Heart
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import SearchDrawer from './SearchDrawer'
import NotificationDrawer from './NotificationDrawer'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isCookbookOpen, setIsCookbookOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  
  
  // --- NEW STATE ---
  const [isSearchOpen, setIsSearchOpen] = useState(false)

    // --- TOGGLE HANDLERS (Mutually Exclusive) ---
  const toggleSearch = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false)
    } else {
      setIsSearchOpen(true)
      setIsNotificationOpen(false) // Force close Notification
    }
  }

  const toggleNotifications = () => {
    if (isNotificationOpen) {
      setIsNotificationOpen(false)
    } else {
      setIsNotificationOpen(true)
      setIsSearchOpen(false) // Force close Search
    }
  }

  // Fetch Profile Data Helper Function
  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('username, avatar_url, email')
      .eq('id', userId)
      .single()
    
    if (data) {
      setUser(data)
      setAvatarUrl(data.avatar_url)
    }
  }

  useEffect(() => {
    const getInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await fetchUserProfile(user.id)
    }
    getInitialUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setAvatarUrl(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAvatarUrl(null)
    router.push('/login')
    router.refresh()
  }

  const linkClass = (path: string) => `
    flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
    ${pathname === path 
      ? 'bg-orange-50 text-orange-600 font-bold' 
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
  `

  return (
    <>
      {/* --- INCLUDE SEARCH DRAWER --- */}
      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationDrawer isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} /> 

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-gray-100 bg-white z-[60]">
        <div className="p-6 pb-2">
            <Link href="/" className="flex w-[160px] items-center gap-2 group">
                <img src="/fyp-logo.png" alt="Sedapify" />
            </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <Link href="/" className={linkClass('/')}>
            <Home size={24} />
            <span className="text-md">Home</span>
          </Link>

          {/* --- NEW SEARCH BUTTON --- */}
          <button 
            onClick={toggleSearch}
            className={`w-full ${isSearchOpen ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200`}
          >
            <Search size={24} />
            <span className="text-md">Search</span>
          </button>

          <Link href="/discover" className={linkClass('/discover')}>
            <Compass size={24} />
            <span className="text-md">Discover</span>
          </Link>

          <Link href="/reels" className={linkClass('/reels')}>
            <PlaySquare size={24} />
            <span className="text-md">Reels</span>
          </Link>

          {/* ... Rest of your existing links ... */}
          <Link href="/groceries" className={linkClass('/groceries')}>
            <ShoppingBasket size={24} />
            <span className="text-md">Groceries</span>
          </Link>

          <Link href="/ranking" className={linkClass('/ranking')}>
            <Trophy size={24} />
            <span className="text-md">Ranking</span>
          </Link>

          <button 
            onClick={toggleNotifications}
            className={`w-full ${isNotificationOpen ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200`}
          >
            <Heart size={24} />
            <span className="text-md">Notifications</span>
          </button>

          <div>
            <button 
              onClick={() => setIsCookbookOpen(!isCookbookOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <BookOpen size={24} />
                <span className="text-md">Cookbook</span>
              </div>
              {isCookbookOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {isCookbookOpen && (
                <div className="pl-12 space-y-1 mt-1">
                    <Link href="/generated-recipes" className="block py-2 text-sm text-gray-500 hover:text-orange-600 transition">
                    Generated Recipes
                    </Link>
                    <Link href="/profile" className="block py-2 text-sm text-gray-500 hover:text-orange-600 transition">
                    Saved Collections
                    </Link>
                </div>
            )}
          </div>
          
          <div className="border-t border-gray-100">
             <Link href="/recipe/create" className={linkClass('/recipe/create')}>
                <PlusSquare size={24} className="text-orange-500" />
                <span className="text-md font-bold text-orange-500">Share Recipe</span>
            </Link>
          </div>
        </nav>

        {/* User Footer (Unchanged) */}
        <div className="p-4 border-t border-gray-100">
          {user ? (
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition group">
              <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
                    {avatarUrl ? (
                    <Image src={avatarUrl} alt="User" fill className="object-cover" />
                    ) : (
                    <User className="w-full h-full p-2 text-gray-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.username || 'Chef'}</p>
                    <p className="text-xs text-gray-500 truncate">View Profile</p>
                </div>
              </Link>
              <button onClick={handleSignOut} className="text-gray-400 hover:text-red-500 transition">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center justify-center w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition">
              Log in
            </Link>
          )}
        </div>
      </aside>

      {/* --- MOBILE BOTTOM BAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-[50] flex justify-around items-center py-3 pb-safe">
        <Link href="/" className={`p-2 ${pathname === '/' ? 'text-orange-500' : 'text-gray-500'}`}>
           <Home size={24} />
        </Link>
        
        {/* Mobile Search Button */}
        <Link href="/discover" className={`p-2 ${pathname === '/discover' ? 'text-orange-500' : 'text-gray-500'}`}>
           <Compass size={24} />
        </Link>
        <Link href="/recipe/create" className="p-2 text-orange-500">
           <PlusSquare size={28} />
        </Link>
        <Link href="/groceries" className={`p-2 ${pathname === '/groceries' ? 'text-orange-500' : 'text-gray-500'}`}>
           <ShoppingBasket size={24} />
        </Link>
        <Link href="/profile" className={`p-2 ${pathname === '/profile' ? 'text-orange-500' : 'text-gray-500'}`}>
           <User size={24} />
        </Link>
      </nav>
    </>
  )
}