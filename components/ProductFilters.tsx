'use client'

import { Search, Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce' // Optional: Run `npm install use-debounce` or just use standard timeout

export default function ProductFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Helper to update URL
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    router.replace(`/admin/products?${params.toString()}`)
  }

  const handleCategory = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (category && category !== 'All') {
      params.set('cat', category)
    } else {
      params.delete('cat')
    }
    router.replace(`/admin/products?${params.toString()}`)
  }

  return (
    <div className="flex gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          placeholder="Search products..." 
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Category Dropdown */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <select 
          onChange={(e) => handleCategory(e.target.value)}
          defaultValue={searchParams.get('cat') || 'All'}
          className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black appearance-none cursor-pointer"
        >
          <option value="All">All Categories</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Meat & Poultry">Meat & Poultry</option>
          <option value="Seafood">Seafood</option>
          <option value="Pantry">Pantry</option>
          <option value="Dairy & Eggs">Dairy & Eggs</option>
        </select>
      </div>
    </div>
  )
}