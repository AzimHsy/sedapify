'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { CheckCircle, Clock, Package, Truck, Home } from 'lucide-react'

const STEPS = [
  { id: 'pending', label: 'Order Placed', icon: Clock },
  { id: 'preparing', label: 'Preparing', icon: Package },
  { id: 'driver_assigned', label: 'Driver Assigned', icon: Truck },
  { id: 'picked_up', label: 'Heading to You', icon: Truck },
  { id: 'completed', label: 'Delivered', icon: Home },
]

export default function OrderStatusTracker({ orderId, initialStatus }: { orderId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const supabase = createClient()

  useEffect(() => {
    // Listen for Order Updates
    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders', 
        filter: `id=eq.${orderId}` 
      }, (payload) => {
        setStatus(payload.new.status)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId])

  // Helper to check if step is completed
  const isCompleted = (stepId: string) => {
    const statusOrder = ['pending', 'paid', 'preparing', 'ready_for_pickup', 'driver_assigned', 'picked_up', 'completed']
    return statusOrder.indexOf(status) >= statusOrder.indexOf(stepId)
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="font-bold text-lg mb-6">Status</h2>
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
        
        <div className="space-y-6">
            {STEPS.map((step) => {
                const active = isCompleted(step.id)
                const Icon = step.icon
                return (
                    <div key={step.id} className="relative flex items-center gap-4">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${active ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                            {active ? <CheckCircle size={14} /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                        </div>
                        <div className={active ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                            {step.label}
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  )
}