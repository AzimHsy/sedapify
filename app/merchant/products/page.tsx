import { getMerchantProducts, deleteMerchantProduct } from '@/app/actions/merchantActions'
import MerchantProductForm from '@/components/MerchantProductForm'
import { Trash2, Package } from 'lucide-react'
import Image from 'next/image'

export default async function MerchantProductsPage() {
  const products = await getMerchantProducts()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Inventory Management</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT: Product List */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Package size={20} className="text-blue-600"/> 
                        Your Products ({products.length})
                    </h3>
                </div>
                
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Product</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {products.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-400">No products added yet.</td></tr>
                    ) : (
                        products.map((product: any) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition">
                            <td className="p-4 font-medium flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 relative overflow-hidden border border-gray-200">
                                    {product.image_url && <Image src={product.image_url} alt="" fill className="object-cover" />}
                                </div>
                                <div>
                                    <p className="text-gray-900">{product.name}</p>
                                    <p className="text-[10px] text-gray-400">{product.unit}</p>
                                </div>
                            </td>
                            <td className="p-4 text-gray-900 font-bold">RM {product.price.toFixed(2)}</td>
                            <td className="p-4">
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">
                                {product.category}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <form action={async () => {
                                'use server'
                                await deleteMerchantProduct(product.id)
                                }}>
                                <button className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition">
                                    <Trash2 size={16} />
                                </button>
                                </form>
                            </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* RIGHT: Add Form */}
        <div>
            <MerchantProductForm />
        </div>

      </div>
    </div>
  )
}