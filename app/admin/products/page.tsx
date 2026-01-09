import { createClient } from '@/lib/supabase/server'
import { deleteProduct } from '@/app/actions/adminActions'
import { Trash2, AlertTriangle } from 'lucide-react'
import Image from 'next/image'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  
  // Fetch data
  const { data: products } = await supabase.from('products').select('*, shops(name)').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Moderation</h1>
        <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg text-sm border border-yellow-200 flex items-center gap-2">
            <AlertTriangle size={16} />
            Note: Product creation is handled by Merchants.
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm">Product</th>
              <th className="p-4 text-sm">Shop</th>
              <th className="p-4 text-sm">Price</th>
              <th className="p-4 text-sm text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products?.map((product: any) => (
              <tr key={product.id}>
                <td className="p-4 font-medium flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 relative overflow-hidden">
                        {product.image_url && <Image src={product.image_url} alt="" fill className="object-cover" />}
                    </div>
                    <div>
                        <p>{product.name}</p>
                        <p className="text-xs text-gray-400">{product.category}</p>
                    </div>
                </td>
                <td className="p-4 text-sm text-gray-600">{product.shops?.name}</td>
                <td className="p-4 text-gray-900 font-bold">RM {product.price}</td>
                <td className="p-4 text-right">
                  <form action={async () => {
                    'use server'
                    await deleteProduct(product.id)
                  }}>
                    <button className="text-red-500 hover:bg-red-50 p-2 rounded transition" title="Remove Item">
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
  )
}