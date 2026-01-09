import { getOrders, acceptJob, updateOrderStatus } from '@/app/actions/orderActions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MapPin, Navigation, MessageCircle, Package, CheckCircle, Wallet, Bell, ChevronRight, User, Lock } from 'lucide-react'
import OrderChat from '@/components/OrderChat'
import DriverLocationSimulator from '@/components/DriverLocationSimulator'
import Image from 'next/image'

export default async function DriverDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role, username, avatar_url').eq('id', user.id).single()
  if (profile?.role !== 'driver') redirect('/')

  const orders = await getOrders()

  // 1. Separate Active Job from New Requests
  const activeOrders = orders.filter((o: any) => o.driver_id === user.id && o.status !== 'completed' && o.status !== 'cancelled')
  const poolOrders = orders.filter((o: any) => o.status === 'ready_for_pickup' && !o.driver_id)
  
  // 2. CHECK: Is the driver busy?
  const isBusy = activeOrders.length > 0;

  // Earnings calculation
  const completedOrders = orders.filter((o: any) => o.driver_id === user.id && o.status === 'completed')
  const totalEarnings = completedOrders.reduce((acc: number, curr: any) => acc + (curr.total_amount * 0.2), 0)

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-32 font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className={`w-10 h-10 rounded-full overflow-hidden border-2 p-0.5 ${isBusy ? 'border-orange-500' : 'border-green-500'}`}>
                        {profile?.avatar_url ? (
                            <Image src={profile.avatar_url} alt="Me" width={40} height={40} className="object-cover rounded-full" />
                        ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center"><User size={20}/></div>
                        )}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-gray-900 rounded-full ${isBusy ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                </div>
                <div>
                    <h1 className="font-bold text-sm leading-tight">{profile?.username || 'Driver'}</h1>
                    <div className={`flex items-center gap-1 text-xs font-medium ${isBusy ? 'text-orange-400' : 'text-green-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-orange-400' : 'bg-green-400 animate-pulse'}`}></span> 
                        {isBusy ? 'BUSY' : 'ONLINE'}
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                <div className="bg-gray-800 px-3 py-1.5 rounded-full flex items-center gap-2 border border-gray-700">
                    <Wallet size={14} className="text-yellow-400" />
                    <span className="font-mono font-bold text-sm">RM {totalEarnings.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">

        {/* --- SECTION 1: ACTIVE JOB (Shown if exists) --- */}
        {activeOrders.length > 0 && (
            <section className="animate-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                    <Navigation size={14} /> Deliver Now
                </h2>
                
                {activeOrders.map((order: any) => (
                    <div key={order.id} className="bg-gray-900 rounded-3xl border border-green-600/30 overflow-hidden shadow-2xl shadow-green-900/20 relative">
                        {/* Status Bar */}
                        <div className="bg-green-600/10 p-4 border-b border-green-600/20 flex justify-between items-center">
                            <span className="text-green-400 font-bold text-sm flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                {order.status === 'driver_assigned' ? 'Heading to Store' : 'Delivery in Progress'}
                            </span>
                            <span className="font-mono text-white font-bold">RM {order.total_amount}</span>
                        </div>

                        <div className="p-5 space-y-6">
                            {/* Timeline */}
                            <div className="relative pl-4 space-y-8">
                                <div className="absolute left-[21px] top-3 bottom-8 w-0.5 bg-gray-700"></div>
                                <div className="flex gap-4 relative">
                                    <div className="w-4 h-4 rounded-full border-4 border-orange-500 bg-gray-900 z-10 mt-1"></div>
                                    <div>
                                        <p className="text-xs text-orange-500 font-bold mb-0.5">PICK UP</p>
                                        <p className="font-bold text-lg text-white leading-tight">{order.shops?.name}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 relative">
                                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] z-10 mt-1"></div>
                                    <div>
                                        <p className="text-xs text-green-500 font-bold mb-0.5">DROP OFF</p>
                                        <p className="font-bold text-lg text-white leading-tight">{order.users?.username}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="pt-2">
                                {order.status === 'driver_assigned' && (
                                    <form action={async () => { 'use server'; await updateOrderStatus(order.id, 'picked_up') }}>
                                        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-900/20 active:scale-95 transition flex items-center justify-center gap-2">
                                            <Package size={20} /> I Have Picked Up Order
                                        </button>
                                    </form>
                                )}

                                {order.status === 'picked_up' && (
                                    <form action={async () => { 'use server'; await updateOrderStatus(order.id, 'completed') }}>
                                        <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-900/20 active:scale-95 transition flex items-center justify-center gap-2">
                                            <CheckCircle size={20} /> Complete Delivery
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 border-t border-gray-700 text-gray-800">
                            <div className="text-xs text-gray-400 font-bold mb-2 flex items-center gap-2">
                                <MessageCircle size={14} /> LIVE CHAT
                            </div>
                            <OrderChat orderId={order.id} userId={user.id} />
                        </div>
                    </div>
                ))}
            </section>
        )}

        {/* --- SECTION 2: NEW REQUESTS (Always Visible) --- */}
        <section className={isBusy ? 'opacity-50 grayscale transition duration-500' : ''}>
            <div className="flex justify-between items-center mb-3 px-1">
                <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Bell size={14} /> New Requests ({poolOrders.length})
                </h2>
            </div>

            {poolOrders.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-2xl">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Navigation size={32} className="text-gray-500" />
                    </div>
                    <p className="text-gray-600 text-sm">Searching for jobs...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {poolOrders.map((order: any) => (
                        <div key={order.id} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 relative group">
                            <div className="absolute top-4 right-4 text-green-400 font-mono font-bold text-lg">
                                RM {order.total_amount}
                            </div>
                            
                            <div className="mb-4">
                                <div className="text-xs font-bold text-orange-500 mb-1">STORE PICKUP</div>
                                <h3 className="text-xl font-bold text-white mb-1">{order.shops?.name}</h3>
                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                    <MapPin size={12} /> Near You
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mb-5 p-3 bg-gray-900/50 rounded-xl">
                                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                    <User size={14} className="text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Deliver to</p>
                                    <p className="text-sm font-bold text-gray-200">{order.users?.username}</p>
                                </div>
                            </div>

                            {/* CONDITIONAL BUTTON LOGIC */}
                            {isBusy ? (
                                <button disabled className="w-full bg-gray-700 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                                    <Lock size={16} /> Complete Active Job First
                                </button>
                            ) : (
                                <form action={async () => { 'use server'; await acceptJob(order.id) }}>
                                    <button className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 active:scale-95">
                                        Accept Request <ChevronRight size={18} />
                                    </button>
                                </form>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>

      </main>

      <DriverLocationSimulator driverId={user.id} />
    </div>
  )
}