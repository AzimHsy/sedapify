'use client'

import { useState } from 'react'
import { MapPin, Loader2, Store, Navigation } from 'lucide-react'
import Image from 'next/image'

// Haversine Formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default function ShopSelector({ shops, onShopSelect }: { shops: any[], onShopSelect: (shop: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [sortedShops, setSortedShops] = useState<any[]>(shops)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  const handleGetLocation = () => {
    setLoading(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude
        
        setUserLocation({ lat: userLat, lng: userLng })

        // 1. Calculate distance
        const shopsWithDistance = shops.map(shop => ({
            ...shop,
            distance: calculateDistance(userLat, userLng, shop.lat, shop.lng)
        }))

        // 2. Sort by nearest
        const sorted = shopsWithDistance.sort((a, b) => a.distance - b.distance)
        
        setSortedShops(sorted)
        setLoading(false)
      }, (error) => {
        alert("Location needed for delivery calculation.")
        setLoading(false)
      })
    } else {
        alert("Geolocation is not supported.")
        setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 h-[80vh] flex flex-col">
        
        <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Select Store</h2>
            <p className="text-sm text-gray-500">We need your location to check delivery availability.</p>
        </div>

        {/* Location Button - Disappears after location is found */}
        {!userLocation ? (
            <div className="flex-1 flex flex-col justify-center">
                <button 
                    onClick={handleGetLocation}
                    disabled={loading}
                    className="w-full bg-green-600 text-white p-4 rounded-xl font-bold mb-6 flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-100 animate-pulse"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Navigation size={20} />}
                    {loading ? "Calculating..." : "Find Nearest Stores"}
                </button>
                <p className="text-xs text-center text-gray-400">
                    *Geospatial Logic: Distance {'>'} 15km will be blocked.
                </p>
            </div>
        ) : (
            /* Shop List - Only appears AFTER location is found */
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar animate-in slide-in-from-bottom-4">
              <p className="text-sm font-bold text-green-700 mb-2">Stores near you:</p>
              {sortedShops.map((shop) => (
                <button 
                  key={shop.id}
                  onClick={() => onShopSelect(shop)}
                  className="w-full flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-green-500 hover:bg-green-50 transition text-left group"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {shop.image_url ? (
                          <Image src={shop.image_url} alt={shop.name} fill className="object-cover" />
                      ) : (
                          <Store className="w-full h-full p-4 text-gray-400" />
                      )}
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-900 block group-hover:text-green-700 transition">{shop.name}</span>
                        {shop.distance !== undefined && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                                shop.distance > 15 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                            }`}>
                                {shop.distance.toFixed(1)} km
                            </span>
                        )}
                     </div>
                     <p className="text-xs text-gray-500 mt-1 line-clamp-2">{shop.address}</p>
                  </div>
                </button>
              ))}
            </div>
        )}
      </div>
    </div>
  )
}