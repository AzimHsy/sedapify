import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, MessageCircle, ShoppingBag, User, Star, Clock, Store } from 'lucide-react'
import Image from 'next/image'
import LiveMap from '@/components/LiveMap'
import OrderStatusTracker from '@/components/OrderStatusTracker'
import OrderChat from '@/components/OrderChat'

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch Order Details
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      shops (name, lat, lng, image_url, address),
      drivers (
        id, 
        current_lat, 
        current_lng, 
        vehicle_type, 
        is_online,
        users (username, avatar_url)
      ),
      order_items (quantity, products(name, price, image_url))
    `)
    .eq('id', id)
    .single()

  if (!order) return <div className="p-10 text-center">Order not found</div>

  const isCompleted = order.status === 'completed'

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link 
                    href="/orders" 
                    className="p-2 rounded-full hover:bg-gray-100 transition border border-gray-200"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="font-bold text-xl text-gray-900">Tracking Order</h1>
                    <p className="text-xs text-gray-500 font-mono">ID: {order.id}</p>
                </div>
            </div>
            
            {isCompleted && (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Delivered
                </div>
            )}
        </div>
      </header>

      {/* --- MAIN GRID LAYOUT --- */}
      <main className="max-w-7xl mx-auto p-6 grid lg:grid-cols-3 gap-8">
        
        {/* === LEFT COLUMN: MAP & RECEIPT (Span 2) === */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. THE MAP CONTAINER */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden h-[500px] relative group">
                <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Live View</p>
                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Real-time Update
                    </div>
                </div>

                <LiveMap 
                    shopLocation={{ lat: order.shops?.lat || 0, lng: order.shops?.lng || 0 }}
                    deliveryLocation={order.delivery_lat ? { lat: order.delivery_lat, lng: order.delivery_lng } : undefined}
                    driverId={order.driver_id}
                    initialDriverLocation={
                        order.drivers && order.drivers.current_lat != null
                        ? { lat: order.drivers.current_lat, lng: order.drivers.current_lng }
                        : undefined
                    }
                />
            </div>

            {/* 2. ORDER RECEIPT */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                        <ShoppingBag size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{order.shops?.name}</h3>
                        <p className="text-xs text-gray-500">{order.shops?.address}</p>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                    {order.order_items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                                    {item.products?.image_url && <Image src={item.products.image_url} alt="" fill className="object-cover"/>}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{item.products?.name}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <span className="font-bold text-gray-900">RM {(item.products.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-6 flex justify-between items-center border-t border-gray-100">
                    <span className="text-gray-500 font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-900">RM {order.total_amount.toFixed(2)}</span>
                </div>
            </div>

        </div>

        {/* === RIGHT COLUMN: STATUS & DRIVER (Span 1) === */}
        <div className="space-y-6">
            
            {/* 3. STATUS TRACKER */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock size={18} className="text-orange-500" /> Activity Timeline
                </h3>
                <OrderStatusTracker orderId={order.id} initialStatus={order.status} />
            </div>

            {/* 4. DRIVER CARD */}
            {order.driver_id && order.drivers ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 bg-gradient-to-b from-blue-50 to-white">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200">
                                    {order.drivers.users?.avatar_url ? (
                                        <Image src={order.drivers.users.avatar_url} alt="Driver" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><User /></div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 border-2 border-white rounded-full animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{order.drivers.users?.username}</h2>
                                <p className="text-gray-500 text-sm">{order.drivers.vehicle_type || 'Delivery Partner'}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
                                <Phone size={16} /> Call
                            </button>
                            <div className="flex items-center justify-center gap-1 text-orange-500 font-bold text-sm">
                                <Star size={16} fill="currentColor" /> 4.9 Rating
                            </div>
                        </div>
                    </div>

                    {/* Chat Section */}
                    <div className="border-t border-gray-100 bg-white p-2">
                        <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                            <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                <MessageCircle size={14} /> Direct Message
                            </div>
                            <OrderChat orderId={order.id} userId={user.id} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 rounded-3xl p-8 text-center border border-blue-100">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
                        <MapPin className="text-blue-500" size={24} />
                    </div>
                    <h3 className="font-bold text-blue-900">Finding a driver...</h3>
                    <p className="text-blue-600/80 text-sm">Please wait while we connect you.</p>
                </div>
            )}

        </div>

      </main>
    </div>
  )
}