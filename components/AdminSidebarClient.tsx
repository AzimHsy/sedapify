'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, ArrowLeft, ChefHat, Users, Video, Settings, BarChart3, LucideIcon } from 'lucide-react'
import Image from 'next/image'

interface NavItem {
  href: string
  icon: string
  label: string
}

interface AdminSidebarClientProps {
  navItems: NavItem[]
  userEmail?: string | null
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ShoppingBag,
  Package,
  ChefHat,
  Users,
  Video,
  Settings,
  BarChart3,
}

export default function AdminSidebarClient({ navItems, userEmail }: AdminSidebarClientProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-50 shadow-sm">
      
      {/* Logo & Brand */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Image src="/sedapify-logo-2.png" alt="Logo" width={40} height={40} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">Sedapify Management</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon]
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-orange-50 text-orange-600 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon 
                size={20} 
                className={`${
                  isActive 
                    ? 'text-orange-600' 
                    : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-200 space-y-2">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all group"
        >
          <ArrowLeft size={20} className="text-gray-400 group-hover:text-orange-600" />
          <span className="font-medium">Back to App</span>
        </Link>
        
        {/* User Info Card */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              {userEmail?.[0].toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Admin</p>
              <p className="text-xs text-gray-600 truncate">{userEmail || 'admin@sedapify.com'}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}