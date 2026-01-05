'use client'

import { addProduct } from '@/app/actions/adminActions'
import { useRef, useState } from 'react'
import { Loader2, Upload } from 'lucide-react'

// Define the shops type for props
type Shop = {
  id: string
  name: string
}

export default function AdminProductForm({ shops }: { shops: Shop[] }) {
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function clientAction(formData: FormData) {
    setLoading(true)
    
    // Call the server action
    const result = await addProduct(formData)

    setLoading(false)

    if (result?.error) {
      alert(result.error) // Show error
    } else {
      alert("Product added successfully!")
      formRef.current?.reset() // Clear form on success
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-4">
      <h2 className="font-bold text-lg mb-4">Add New Product</h2>
      
      <form ref={formRef} action={clientAction} className="space-y-4">
        
        <div>
          <label className="text-xs font-bold text-gray-500">Shop</label>
          <select name="shop_id" className="w-full p-2 border rounded-lg bg-gray-50" required>
            {shops?.map(shop => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500">Product Name</label>
          <input name="name" className="w-full p-2 border rounded-lg" placeholder="e.g. Fresh Chicken" required />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-gray-500">Price (RM)</label>
            <input name="price" type="number" step="0.01" className="w-full p-2 border rounded-lg" placeholder="0.00" required />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500">Unit</label>
            <input name="unit" className="w-full p-2 border rounded-lg" placeholder="e.g. 1kg" required />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500">Category</label>
          <select name="category" className="w-full p-2 border rounded-lg bg-white" required>
            <option>Vegetables</option>
            <option>Meat & Poultry</option>
            <option>Seafood</option>
            <option>Pantry</option>
            <option>Dairy & Eggs</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500">Image</label>
          <div className="border border-dashed border-gray-300 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
             <input type="file" name="image" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer" />
          </div>
        </div>

        <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Add Product"}
        </button>
      </form>
    </div>
  )
}