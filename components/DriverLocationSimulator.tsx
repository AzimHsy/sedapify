'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Navigation, StopCircle, Play } from 'lucide-react'

export default function DriverLocationSimulator({ driverId }: { driverId: string }) {
  const [isSimulating, setIsSimulating] = useState(false)
  const supabase = createClient()

  // Start at Mid Valley (Example)
  const START_LAT = 3.1176
  const START_LNG = 101.6770

  const handleSimulation = () => {
    if (isSimulating) {
      // Stop logic is handled by the reloading state, 
      // but simple toggle here effectively stops the loop on next render if we used useEffect.
      // For a button click loop, we just use a flag variable in the loop.
      window.location.reload() // Quick way to stop the loop for demo
      return
    }

    setIsSimulating(true)
    let step = 0
    
    // Update every 2 seconds
    const interval = setInterval(async () => {
      step += 1
      
      // Move slightly North-East each step (0.0005 degrees)
      const newLat = START_LAT + (step * 0.0005)
      const newLng = START_LNG + (step * 0.0005)

      console.log(`📍 Updating Driver Loc: ${newLat}, ${newLng}`)

      await supabase
        .from('drivers')
        .update({ 
            current_lat: newLat, 
            current_lng: newLng,
            last_updated: new Date().toISOString()
        })
        .eq('id', driverId)

    }, 2000) // 2 seconds speed
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={handleSimulation}
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg font-bold transition ${
            isSimulating ? 'bg-red-600 text-white animate-pulse' : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isSimulating ? <StopCircle size={20} /> : <Play size={20} />}
        {isSimulating ? 'Simulating GPS...' : 'Start Demo GPS'}
      </button>
    </div>
  )
}