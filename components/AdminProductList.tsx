'use client'

import { useState } from 'react'
import { Trash2, Edit } from 'lucide-react'
import { deleteProduct } from '@/app/actions/adminActions'
import AdminEditProductModal from './AdminEditProductModal'

export default function AdminProductList({ products, shops }: { products: any[], shops: any[] }) {
  const [editingProduct, setEditingProduct] = useState<any>(null)

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm font-bold text-gray-500">Product</th>
              <th className="p-4 text-sm font-bold text-gray-500">Price</th>
              <th className="p-4 text-sm font-bold text-gray-500">Category</th>
              <th className="p-4 text-sm font-bold text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium flex items-center gap-3">
                     {product.image_url && (
                       <img src={product.image_url} className="w-8 h-8 rounded object-cover bg-gray-100" alt="" />
                     )}
                     <div>
                       <p className="text-gray-900">{product.name}</p>
                       <p className="text-[10px] text-gray-400">{product.unit}</p>
                     </div>
                  </td>
                  <td className="p-4 text-gray-600">RM {product.price.toFixed(2)}</td>
                  <td className="p-4">
                     <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                       {product.category}
                     </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {/* EDIT BUTTON */}
                        <button 
                          onClick={() => setEditingProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                           <Edit size={16} />
                        </button>

                        {/* DELETE BUTTON */}
                        <button 
                          onClick={async () => {
                            if(confirm("Delete this product?")) await deleteProduct(product.id)
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                        >
                           <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      <AdminEditProductModal 
        product={editingProduct}
        shops={shops}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
      />
    </>
  )
}