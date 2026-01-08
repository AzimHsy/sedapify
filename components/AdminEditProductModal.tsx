'use client'

import { useState } from 'react'
import { X, Loader2, Save } from 'lucide-react'
import { updateProduct } from '@/app/actions/adminActions'

interface EditModalProps {
  product: any
  shops: any[]
  isOpen: boolean
  onClose: () => void
}

export default function AdminEditProductModal({ product, shops, isOpen, onClose }: EditModalProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleUpdate(formData: FormData) {
    setLoading(true)
    const result = await updateProduct(formData)
    setLoading(false)
    
    if (result?.error) {
      alert(result.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold mb-6">Edit Product</h2>

        <form action={handleUpdate} className="space-y-4">
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="current_image_url" value={product.image_url || ''} />

          <div>
            <label className="text-xs font-bold text-gray-500">Product Name</label>
            <input name="name" defaultValue={product.name} className="w-full p-2 border rounded-lg" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500">Price (RM)</label>
              <input name="price" type="number" step="0.01" defaultValue={product.price} className="w-full p-2 border rounded-lg" required />
            </div>
            <div>
               <label className="text-xs font-bold text-gray-500">Shop</label>
               <select name="shop_id" defaultValue={product.shop_id} className="w-full p-2 border rounded-lg bg-white">
                  {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
               </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-xs font-bold text-gray-500">Category</label>
               <select name="category" defaultValue={product.category} className="w-full p-2 border rounded-lg bg-white">
                  {["Vegetables", "Meat & Poultry", "Seafood", "Pantry", "Dairy & Eggs"].map(c => (
                      <option key={c} value={c}>{c}</option>
                  ))}
               </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Unit</label>
              <input name="unit" defaultValue={product.unit} className="w-full p-2 border rounded-lg" required />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Change Image (Optional)</label>
            <input type="file" name="image" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </form>

      </div>
    </div>
  )
}