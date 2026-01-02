'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // 1. Define paths where NO menu should appear (Login/Signup)
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  // CASE 1: Login Page -> Return ONLY content (No Sidebar)
  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-white">
        {children}
      </main>
    )
  }

  // CASE 2: ALL Other Pages (Home, Profile, etc.) -> Sidebar + Content
  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Fixed Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      {/* md:ml-64 pushes content to the right so Sidebar doesn't cover it */}
      {/* pb-20 adds padding at bottom for mobile bottom-bar */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 w-full min-h-screen transition-all duration-300">
        {children}
      </main>
      
    </div>
  )
}