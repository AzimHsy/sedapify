import { createClient } from '@/lib/supabase/server'
import { deleteProduct } from '@/app/actions/adminActions'
import { Trash2 } from 'lucide-react'
import AdminProductForm from '@/components/AdminProductForm' // <--- IMPORT THIS

export default async function AdminProductsPage() {
  const supabase = await createClient()
  
  // Fetch data
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  const { data: shops } = await supabase.from('shops').select('id, name') // Only need id and name for dropdown

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      
      {/* LEFT: Product List */}
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-2xl font-bold">Current Inventory</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-sm">Product</th>
                <th className="p-4 text-sm">Price</th>
                <th className="p-4 text-sm">Category</th>
                <th className="p-4 text-sm">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products?.map((product) => (
                <tr key={product.id}>
                  <td className="p-4 font-medium flex items-center gap-3">
                     {/* Optional: Show tiny image preview */}
                     {product.image_url && <img src={product.image_url} className="w-8 h-8 rounded object-cover bg-gray-100" />}
                     {product.name}
                  </td>
                  <td className="p-4 text-gray-600">RM {product.price}</td>
                  <td className="p-4 text-xs text-gray-500">{product.category}</td>
                  <td className="p-4">
                    <form action={async () => {
                      'use server'
                      await deleteProduct(product.id)
                    }}>
                      <button className="text-red-500 hover:bg-red-50 p-2 rounded transition">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: Add Product Form (Using the Client Component) */}
      <div>
        <AdminProductForm shops={shops || []} />
      </div>

    </div>
  )
}