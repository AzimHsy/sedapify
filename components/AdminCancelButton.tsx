'use client' // <--- This marks it as a Client Component (Browser)

import { adminCancelOrder } from '@/app/actions/adminActions'
import { Ban } from 'lucide-react'

export default function AdminCancelButton({ orderId }: { orderId: string }) {
  const handleCancel = async () => {
    // Now 'confirm' works because this runs in the browser
    if (confirm("Are you sure you want to force cancel this order? This cannot be undone.")) {
      await adminCancelOrder(orderId)
    }
  }

  return (
    <button 
      onClick={handleCancel}
      className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 border border-red-200 flex items-center gap-1 ml-auto transition"
    >
      <Ban size={12} /> Force Cancel
    </button>
  )
}