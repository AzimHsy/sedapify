'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { MapPin, Store, Car, Navigation } from 'lucide-react'

interface Location { lat: number; lng: number }

export default function LiveMap({ 
    shopLocation, 
    deliveryLocation, 
    driverId, 
    initialDriverLocation 
}: { 
    shopLocation: Location, 
    deliveryLocation?: Location,
    driverId?: string, 
    initialDriverLocation?: Location 
}) {
  const [driverLoc, setDriverLoc] = useState<Location | null>(initialDriverLocation || null)
  const supabase = createClient()

  // Base coordinates for the demo (Mid Valley area)
  // We use these to calculate "Percentage" movement on screen
  const BASE_LAT = 3.1176 
  const BASE_LNG = 101.6770
  // The simulator moves about 0.01 degrees total
  const MAX_DELTA = 0.01 

  useEffect(() => {
    if (!driverId) return

    const channel = supabase
      .channel(`driver-loc-${driverId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'drivers', 
        filter: `id=eq.${driverId}` 
      }, (payload) => {
        setDriverLoc({ lat: payload.new.current_lat, lng: payload.new.current_lng })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [driverId])

  // --- CALCULATE POSITION ON SCREEN ---
  // Convert GPS to CSS Percentage (0% to 100%)
  const getPositionStyle = () => {
    if (!driverLoc) return { top: '10%', left: '10%' } // Default at shop

    const latDiff = driverLoc.lat - BASE_LAT
    const lngDiff = driverLoc.lng - BASE_LNG

    // Calculate percentage (clamped between 10% and 90%)
    const topPct = 10 + (latDiff / MAX_DELTA) * 80
    const leftPct = 10 + (lngDiff / MAX_DELTA) * 80

    return { 
        top: `${Math.min(90, Math.max(10, topPct))}%`, 
        left: `${Math.min(90, Math.max(10, leftPct))}%` 
    }
  }

  const carStyle = getPositionStyle()

  return (
    <div className="w-full h-full bg-slate-100 relative overflow-hidden rounded-2xl group border-2 border-slate-200">
        
        {/* 1. Fake Map Background (Streets) */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png')] bg-cover grayscale"></div>
        
        {/* Grid Lines for tech feel */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none">
            {[...Array(36)].map((_, i) => <div key={i} className="border-[0.5px] border-gray-300/50"></div>)}
        </div>

        {/* 2. Shop Marker (Top Left - Fixed) */}
        <div className="absolute top-[10%] left-[10%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="bg-white p-1.5 rounded-full shadow-md border border-orange-500">
                <Store size={20} className="text-orange-600" />
            </div>
            <span className="text-[10px] font-bold text-gray-600 bg-white/80 px-1 rounded mt-1">Shop</span>
        </div>

        {/* 3. Customer Marker (Bottom Right - Fixed) */}
        <div className="absolute top-[90%] left-[90%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="bg-white p-1.5 rounded-full shadow-md border border-green-500">
                <MapPin size={20} className="text-green-600" />
            </div>
            <span className="text-[10px] font-bold text-gray-600 bg-white/80 px-1 rounded mt-1">You</span>
        </div>

        {/* 4. Route Line (Dashed) */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
            <line x1="10%" y1="10%" x2="90%" y2="90%" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="8 4" />
        </svg>

        {/* 5. MOVING DRIVER ICON */}
        {driverId ? (
            <div 
                className="absolute z-20 flex flex-col items-center transition-all duration-[2000ms] ease-linear"
                style={carStyle} // <--- CSS moves this div
            >
                <div className="bg-blue-600 p-2 rounded-full shadow-xl shadow-blue-500/40 ring-4 ring-white relative transform -translate-x-1/2 -translate-y-1/2">
                    <Car size={24} className="text-white" fill="white" />
                    {/* Pulsing Effect */}
                    <span className="absolute -inset-1 rounded-full bg-blue-400 opacity-30 animate-ping"></span>
                </div>
                <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg shadow-sm text-xs font-bold text-blue-700 mt-2 -translate-x-1/2 whitespace-nowrap border border-blue-100">
                    Driver
                </div>
            </div>
        ) : (
            // Loading State
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px] z-30">
                <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold text-gray-500 animate-pulse">
                    <Navigation size={16} /> Finding Driver...
                </div>
            </div>
        )}

    </div>
  )
}