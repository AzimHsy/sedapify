'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Define all paths where the Main Customer Sidebar should be HIDDEN
  const shouldHideSidebar = 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/onboarding' ||
    pathname?.startsWith('/admin') ||    // Hide for Admin Panel
    pathname?.startsWith('/driver') ||   // Hide for Driver App
    pathname?.startsWith('/merchant')    // Hide for Merchant Dashboard

  // CASE 1: Specialized Pages (No Sidebar)
  if (shouldHideSidebar) {
    return (
      <main className="min-h-screen w-full">
        {children}
      </main>
    )
  }

  // CASE 2: Regular Customer Pages (Show Sidebar)
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 w-full min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  )
}