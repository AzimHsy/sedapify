import { getAdminOrders } from '@/app/actions/adminActions'
import { Truck, User, Store } from 'lucide-react'
import AdminCancelButton from '@/components/AdminCancelButton' // <--- Import the new button

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Order Oversight</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Order ID</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Parties Involved</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Intervention</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</td>
                <td className="p-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-gray-700"><User size={12}/> {order.users?.username}</div>
                    <div className="flex items-center gap-2 text-orange-600"><Store size={12}/> {order.shops?.name}</div>
                    {order.driver_id && <div className="flex items-center gap-2 text-green-600"><Truck size={12}/> Driver Assigned</div>}
                  </div>
                </td>
                <td className="p-4 font-bold">RM {order.total_amount}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                      // REPLACE THE FORM WITH THE CLIENT COMPONENT
                      <AdminCancelButton orderId={order.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}