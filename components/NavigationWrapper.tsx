'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // 1. Check for Auth Pages
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  
  // 2. Check for Admin Pages (New Check)
  const isAdminPage = pathname?.startsWith('/admin')

  // CASE 1: Auth Pages OR Admin Pages -> Return ONLY content (No Regular Sidebar)
  if (isAuthPage || isAdminPage) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    )
  }

  // CASE 2: Regular User Pages -> Sidebar + Content
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 w-full min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  )
}