'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
// Assume you use Leaflet or Google Maps components

export default function DriverMap({ driverId }: { driverId: string }) {
  const [location, setLocation] = useState({ lat: 0, lng: 0 })
  const supabase = createClient()

  useEffect(() => {
    // 1. Initial Fetch
    const fetchDriver = async () => {
        const { data } = await supabase.from('drivers').select('*').eq('id', driverId).single()
        if(data) setLocation({ lat: data.current_lat, lng: data.current_lng })
    }
    fetchDriver()

    // 2. Subscribe to Live Updates
    const channel = supabase
      .channel('driver-tracking')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'drivers', 
        filter: `id=eq.${driverId}` 
      }, (payload) => {
        setLocation({ lat: payload.new.current_lat, lng: payload.new.current_lng })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [driverId])

  return (
    // Render your Map Marker here using `location` state
    <div>Driver is at: {location.lat}, {location.lng}</div>
  )
}