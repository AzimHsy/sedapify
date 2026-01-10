import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MerchantSidebar from '@/components/MerchantSidebar'
import { cookies } from 'next/headers'

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'merchant') redirect('/')

  // 1. Fetch ALL shops owned by this merchant
  const { data: shops } = await supabase
    .from('shops')
    .select('id, name, image_url')
    .eq('owner_id', user.id)

  if (!shops || shops.length === 0) {
    return <div className="p-10">You have no shops assigned. Contact Admin.</div>
  }

  // 2. Determine Active Shop ID (Cookie > First Shop)
  const cookieStore = await cookies()
  const activeShopId = cookieStore.get('merchant_active_shop')?.value || shops[0].id

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Pass data to Sidebar */}
      <MerchantSidebar shops={shops} activeShopId={activeShopId} />
      
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  )
}