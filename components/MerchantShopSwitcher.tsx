'use client'

import { Store, ChevronDown, Check } from 'lucide-react'
import { useState } from 'react'
import { switchMerchantShop } from '@/app/actions/merchantActions'

interface Shop {
  id: string
  name: string
  image_url?: string
}

export default function MerchantShopSwitcher({ 
  shops, 
  activeShopId 
}: { 
  shops: Shop[], 
  activeShopId: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const activeShop = shops.find(s => s.id === activeShopId) || shops[0]

  const handleSwitch = async (shopId: string) => {
    await switchMerchantShop(shopId)
    setIsOpen(false)
  }

  return (
    <div className="relative mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800 hover:bg-slate-700 transition p-3 rounded-xl flex items-center gap-3 border border-slate-700"
      >
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
           <Store size={20} className="text-white" />
        </div>
        <div className="flex-1 text-left min-w-0">
           <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Managing</p>
           <p className="font-bold text-white truncate">{activeShop?.name || 'Loading...'}</p>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
            {shops.map(shop => (
                <button
                    key={shop.id}
                    onClick={() => handleSwitch(shop.id)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center justify-between group"
                >
                    <span className="text-slate-200 font-medium">{shop.name}</span>
                    {shop.id === activeShopId && <Check size={16} className="text-blue-500" />}
                </button>
            ))}
        </div>
      )}
    </div>
  )
}