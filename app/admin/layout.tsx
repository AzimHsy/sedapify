import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Package, ArrowLeft, ChefHat, Users, Video, Settings, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebarClient from '@/components/AdminSidebarClient'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Protect Route
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const navItems = [
    { href: '/admin', icon: 'LayoutDashboard', label: 'Dashboard' },
    { href: '/admin/orders', icon: 'ShoppingBag', label: 'Orders' },
    { href: '/admin/products', icon: 'Package', label: 'Inventory' },
    { href: '/admin/recipes', icon: 'ChefHat', label: 'Recipes' },
    { href: '/admin/videos', icon: 'Video', label: 'Videos' },
    { href: '/admin/users', icon: 'Users', label: 'Users' },
    { href: '/admin/analytics', icon: 'BarChart3', label: 'Analytics' },
    { href: '/admin/settings', icon: 'Settings', label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-[#FDF8F0] flex">
      
      {/* Admin Sidebar - Use Client Component for pathname detection */}
      <AdminSidebarClient navItems={navItems} userEmail={user.email} />

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}