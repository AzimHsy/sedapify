import { createClient } from "@/lib/supabase/server";
import { getCustomerOrders } from "@/app/actions/orderActions";
import Link from "next/link";
import { ArrowLeft, Box, ChevronRight, Clock, AlertCircle, XCircle } from "lucide-react";
import Image from "next/image";
import PayNowButton from "@/components/PayNowButton";
import OrderTimer from "@/components/OrderTimer";

export default async function MyOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-10">Please log in to view orders.</div>;

  const orders = await getCustomerOrders();

  return (
    <div className="min-h-screen bg-[#FDF8F0] p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Box size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
              <p className="text-gray-500 mb-6">Start shopping to see your history here.</p>
              <Link href="/groceries" className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800">
                Go to Shop
              </Link>
            </div>
          ) : (
            orders.map((order: any) => {
              const isPending = order.status === 'pending';
              const isCancelled = order.status === 'cancelled';
              
              // --- 1. NEW LOGIC: Check for 1 Minute Expiry ---
              const createdTime = new Date(order.created_at).getTime();
              const now = Date.now();
              const diffInMinutes = (now - createdTime) / 1000 / 60;
              
              // If pending AND older than 1 minute, consider it expired
              const isExpired = isPending && diffInMinutes > 1;

              // Only allow tracking if active and NOT expired
              const isTrackable = !isPending && !isCancelled && !isExpired;

              const OrderImages = (
                <div className="flex gap-2 overflow-hidden mb-4 pb-2">
                    {order.order_items.map((item: any, i: number) => (
                    <div key={i} className="relative w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 border border-gray-100 overflow-hidden">
                        {item.products?.image_url && (
                        <Image src={item.products.image_url} alt="" fill className="object-cover" />
                        )}
                    </div>
                    ))}
                    {order.order_items.length > 4 && (
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                        +{order.order_items.length - 4}
                    </div>
                    )}
                </div>
              );

              return (
                <div 
                  key={order.id}
                  className={`block bg-white p-5 rounded-2xl shadow-sm border transition relative
                    ${isPending && !isExpired ? 'border-orange-200 ring-2 ring-orange-50' : 'border-gray-100'}
                    ${isTrackable ? 'hover:shadow-md cursor-pointer' : ''}
                    ${isExpired ? 'opacity-60 grayscale' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order #{order.id.slice(0, 8)}</span>
                      <h3 className="font-bold text-lg text-gray-900 mt-1">
                        RM {order.total_amount.toFixed(2)}
                      </h3>
                      {order.shops?.name && <p className="text-xs text-orange-600 font-bold mt-1">{order.shops.name}</p>}
                    </div>
                    {/* Pass 'cancelled' if expired so badge updates immediately */}
                    <StatusBadge status={isExpired ? 'cancelled' : order.status} />
                  </div>

                  {isTrackable ? (
                    <Link href={`/order/${order.id}`} className="block">
                        {OrderImages}
                    </Link>
                  ) : (
                    <div>{OrderImages}</div> 
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    
                    {/* 2. HIDE BUTTON IF EXPIRED OR CANCELLED */}
                    {isPending && !isExpired && (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-orange-600 text-xs font-bold flex items-center gap-1 mb-1">
                                    <AlertCircle size={14} /> Payment Required
                                </span>
                                <OrderTimer 
                                    createdAt={order.created_at} 
                                    orderId={order.id} 
                                />
                            </div>
                            <PayNowButton orderId={order.id} />
                        </div>
                    )}

                    {(isCancelled || isExpired) && (
                        <div className="flex items-center gap-1 text-gray-400 font-bold">
                            <XCircle size={16} /> Cancelled / Expired
                        </div>
                    )}

                    {isTrackable && (
                        <Link href={`/order/${order.id}`} className="flex items-center gap-1 text-orange-600 font-bold hover:underline">
                            Track Order <ChevronRight size={16} />
                        </Link>
                    )}
                    
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
      pending: 'bg-red-100 text-red-700',
      paid: 'bg-blue-100 text-blue-700',
      preparing: 'bg-purple-100 text-purple-700',
      ready_for_pickup: 'bg-indigo-100 text-indigo-700',
      driver_assigned: 'bg-orange-100 text-orange-700',
      picked_up: 'bg-orange-100 text-orange-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-500',
  }
  return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors[status] || 'bg-gray-100'}`}>
          {status.replace(/_/g, ' ')}
      </span>
  )
}