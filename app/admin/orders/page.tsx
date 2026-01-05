import { getAdminOrders, updateOrderStatus } from '@/app/actions/adminActions'

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Order ID</th>
              <th className="p-4 font-semibold text-gray-600">Customer</th>
              <th className="p-4 font-semibold text-gray-600">Shop</th>
              <th className="p-4 font-semibold text-gray-600">Amount</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-xs text-gray-500">{order.id.slice(0, 8)}...</td>
                <td className="p-4">
                  <div className="font-medium">{order.users?.username}</div>
                  <div className="text-xs text-gray-400">{order.users?.email}</div>
                </td>
                <td className="p-4">{order.shops?.name || 'N/A'}</td>
                <td className="p-4 font-bold">RM {order.total_amount}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                    order.status === 'paid' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <form action={async () => {
                    'use server'
                    await updateOrderStatus(order.id, 'delivered')
                  }}>
                    <button className="text-xs bg-black text-white px-3 py-1.5 rounded hover:opacity-80">
                      Mark Delivered
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