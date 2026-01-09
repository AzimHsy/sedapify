'use client'

import { addMerchantProduct } from '@/app/actions/merchantActions'
import { useState, useRef } from 'react'
import { Loader2, Plus, Upload } from 'lucide-react'

export default function MerchantProductForm() {
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function clientAction(formData: FormData) {
    setLoading(true)
    const result = await addMerchantProduct(formData)
    setLoading(false)

    if (result?.error) {
      alert(result.error)
    } else {
      formRef.current?.reset()
      alert("Product added to your shop!")
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
        <Plus className="bg-blue-100 text-blue-600 rounded p-1" size={24} />
        Add New Product
      </h2>
      
      <form ref={formRef} action={clientAction} className="space-y-5">
        
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
          <input name="name" className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Organic Bananas" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (RM)</label>
            <input name="price" type="number" step="0.01" className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit</label>
            <input name="unit" className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 1 bunch" required />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
          <select name="category" className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option>Vegetables</option>
            <option>Meat & Poultry</option>
            <option>Seafood</option>
            <option>Pantry</option>
            <option>Dairy & Eggs</option>
            <option>Fruits</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Image</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
             <input type="file" name="image" className="absolute inset-0 opacity-0 cursor-pointer" />
             <Upload className="mx-auto text-gray-400 mb-2" size={24} />
             <span className="text-sm text-gray-500">Click to upload image</span>
          </div>
        </div>

        <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Add to Inventory"}
        </button>
      </form>
    </div>
  )
}