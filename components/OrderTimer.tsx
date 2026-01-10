'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'

export default function OrderTimer({ createdAt }: { createdAt: string }) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState("")
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const orderTime = new Date(createdAt).getTime()
    const expireTime = orderTime + (5 * 60 * 1000) // 5 Minutes

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = expireTime - now

      if (diff <= 0) {
        setIsExpired(true)
        clearInterval(interval)
        router.refresh() // Refresh page to trigger backend cancellation
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [createdAt, router])

  if (isExpired) return <span className="text-red-600 font-bold text-xs">Expired</span>

  return (
    <span className="text-orange-600 font-mono font-bold text-xs flex items-center gap-1 bg-orange-100 px-2 py-1 rounded">
      <Clock size={12} /> {timeLeft}
    </span>
  )
}