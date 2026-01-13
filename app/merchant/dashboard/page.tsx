import { getOrders, updateOrderStatus } from '@/app/actions/orderActions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Package, CheckCircle, Truck } from 'lucide-react'
import Image from 'next/image'

export default async function MerchantDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'merchant') redirect('/')

  // Use the generic getOrders (RLS handles filtering)
  const orders = await getOrders()

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Merchant Dashboard</h1>
            <p className="text-gray-500">Manage incoming orders for your shop</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 font-mono text-sm">
             Status: <span className="text-green-600 font-bold">OPEN</span>
          </div>
        </header>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400">No active orders yet.</p>
            </div>
          ) : (
            orders.map((order: any) => {
                if (order.status === 'pending') return null;
                return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-lg">Order #{order.id.slice(0, 8)}</span>
                            <StatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-gray-500">Customer: {order.users?.username || 'Guest'}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-xl text-gray-900">RM {order.total_amount.toFixed(2)}</p>
                        {/* FIX: Suppress Hydration Warning for Date */}
                        <p className="text-xs text-gray-400" suppressHydrationWarning>
                            {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Items List */}
                <div className="p-6 bg-gray-50/50 space-y-4">
                    {order.order_items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 relative overflow-hidden">
                                {item.products?.image_url && <Image src={item.products.image_url} alt="" fill className="object-cover" />}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.products?.name}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <span className="font-bold text-gray-700">RM {(item.quantity * item.products.price).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-3">
                    
                    {(order.status === 'pending' || order.status === 'paid') && (
                        <form action={async () => { 'use server'; await updateOrderStatus(order.id, 'preparing') }}>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition flex items-center gap-2">
                                <Package size={18} /> Accept & Prepare
                            </button>
                        </form>
                    )}

                    {order.status === 'preparing' && (
                        <form action={async () => { 'use server'; await updateOrderStatus(order.id, 'ready_for_pickup') }}>
                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold transition flex items-center gap-2">
                                <Truck size={18} /> Ready for Pickup
                            </button>
                        </form>
                    )}

                    {order.status === 'driver_assigned' && (
                        <div className="text-blue-600 font-bold flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                            <Truck size={18} /> Driver Assigned
                        </div>
                    )}
                    
                    {order.status === 'picked_up' && (
                        <div className="text-orange-600 font-bold flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg">
                            <Truck size={18} /> Out for Delivery
                        </div>
                    )}

                     {order.status === 'completed' && (
                        <div className="text-green-600 font-bold flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                            <CheckCircle size={18} /> Completed
                        </div>
                    )}
                </div>

              </div>
            )}) 
          )}
        </div>

      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
    const colors: any = {
        pending: 'bg-yellow-100 text-yellow-700',
        paid: 'bg-blue-100 text-blue-700',
        preparing: 'bg-blue-100 text-blue-700',
        ready_for_pickup: 'bg-purple-100 text-purple-700',
        driver_assigned: 'bg-indigo-100 text-indigo-700',
        picked_up: 'bg-orange-100 text-orange-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    }
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors[status] || 'bg-gray-100'}`}>
            {status?.replace(/_/g, ' ') || 'Unknown'}
        </span>
    )
}