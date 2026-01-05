import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Package, LogOut, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Protect Route
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full z-50">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-orange-500">Admin Panel</h1>
          <p className="text-gray-400 text-xs">Sedapify Management</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
            <ShoppingBag size={20} /> Orders
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
            <Package size={20} /> Inventory
          </Link>
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition mt-10 text-orange-400">
            <ArrowLeft size={20} /> Back to App
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}