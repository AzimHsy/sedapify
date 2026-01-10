'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import MerchantShopSwitcher from './MerchantShopSwitcher' // <--- Import

// Updated props
export default function MerchantSidebar({ 
  shops, 
  activeShopId 
}: { 
  shops: any[], 
  activeShopId: string 
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/merchant/dashboard', icon: LayoutDashboard, label: 'Live Orders' },
    { href: '/merchant/products', icon: Package, label: 'Inventory' },
    { href: '/merchant/settings', icon: Settings, label: 'Shop Settings' },
  ]

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-50 border-r border-slate-800">
      
      {/* Brand & Switcher */}
      <div className="p-4 border-b border-slate-800">
        <MerchantShopSwitcher shops={shops} activeShopId={activeShopId} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white font-semibold shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}