'use client'

import { payForOrderAction } from '@/app/actions/orderActions'
import { CreditCard, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function PayNowButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)

  const handlePay = async (e: React.MouseEvent) => {
    e.preventDefault() // Stop Link navigation if inside a Link
    e.stopPropagation()
    
    setLoading(true)
    const result = await payForOrderAction(orderId)
    
    if (result.url) {
      window.location.href = result.url
    } else {
      alert("Error starting payment")
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handlePay}
      disabled={loading}
      className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition shadow-md z-20 relative"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
      Pay Now
    </button>
  )
}