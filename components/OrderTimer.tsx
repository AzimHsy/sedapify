'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import { expireOrderNow } from '@/app/actions/orderActions' // <--- Import Action

export default function OrderTimer({ createdAt, orderId }: { createdAt: string, orderId: string }) { // <--- Add orderId prop
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState("")
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const orderTime = new Date(createdAt).getTime()
    const expireTime = orderTime + (1 * 60 * 1000) // 1 Minute

    const interval = setInterval(async () => {
      const now = Date.now()
      const diff = expireTime - now

      if (diff <= 0) {
        clearInterval(interval)
        if (!isExpired) {
            setIsExpired(true)
            // 1. Trigger Database Update
            await expireOrderNow(orderId) 
            // 2. Refresh UI
            router.refresh()
        }
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [createdAt, router, orderId, isExpired])

  if (isExpired) return <span className="text-red-600 font-bold text-xs">Expired</span>

  return (
    <span className="text-orange-600 font-mono font-bold text-xs flex items-center gap-1 bg-orange-100 px-2 py-1 rounded">
      <Clock size={12} /> {timeLeft}
    </span>
  )
}