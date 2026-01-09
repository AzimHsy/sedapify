import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MerchantSidebar from '@/components/MerchantSidebar'

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'merchant') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <MerchantSidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  )
}