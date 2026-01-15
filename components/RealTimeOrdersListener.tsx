'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RealtimeOrdersListener({ shopId }: { shopId?: string }) {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Listen to ANY change in the 'orders' table
    const channel = supabase
      .channel('realtime-orders')
      .on('postgres_changes', { 
        event: '*', // Listen for INSERT, UPDATE, DELETE
        schema: 'public', 
        table: 'orders',
        // Optional: Filter for specific shop if shopId is provided
        filter: shopId ? `shop_id=eq.${shopId}` : undefined 
      }, (payload) => {
        console.log('⚡ Order update detected:', payload)
        router.refresh() // <--- The magic line: Refreshes the Server Components
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router, shopId])

  return null // It's invisible
}