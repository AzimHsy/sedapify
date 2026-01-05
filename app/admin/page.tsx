import { getDashboardStats } from '@/app/actions/adminActions'
import AdminDashboardCharts from '@/components/AdminDashboardCharts'
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, Admin.</p>
        </div>
        <div className="text-right">
           <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              ● System Live
           </span>
        </div>
      </div>
      
      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
            title="Total Revenue" 
            value={`RM ${stats.totalRevenue.toFixed(2)}`} 
            icon={<DollarSign size={24} />} 
            color="bg-green-500" 
            trend="+12% from last week"
        />
        <StatCard 
            title="Total Orders" 
            value={stats.orderCount.toString()} 
            icon={<ShoppingCart size={24} />} 
            color="bg-blue-500"
            trend="+5 new today"
        />
        <StatCard 
            title="Active Users" 
            value={stats.userCount.toString()} 
            icon={<Users size={24} />} 
            color="bg-purple-500"
        />
        <StatCard 
            title="Products" 
            value={stats.productCount.toString()} 
            icon={<Package size={24} />} 
            color="bg-orange-500"
        />
      </div>

      {/* 2. CHARTS */}
      <AdminDashboardCharts data={stats.chartData} />

      {/* 3. RECENT ORDERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-800">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-orange-600 font-bold flex items-center gap-1 hover:underline">
                View All <ArrowUpRight size={16} />
            </Link>
        </div>
        <table className="w-full text-left">
            <thead className="bg-gray-50">
                <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition">
                            <td className="p-4 font-mono text-xs text-gray-400">#{order.id.slice(0,8)}</td>
                            <td className="p-4 text-sm font-medium">{order.users?.username || "Unknown"}</td>
                            <td className="p-4 text-sm font-bold">RM {order.total_amount.toFixed(2)}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                    order.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                    order.status === 'delivered' ? 'bg-gray-100 text-gray-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {order.status}
                                </span>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-400 italic">No orders yet.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

    </div>
  )
}

// Simple Helper Component for Cards
function StatCard({ title, value, icon, color, trend }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl text-white shadow-lg shadow-gray-200 ${color}`}>
                    {icon}
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                    <TrendingUp size={14} /> {trend}
                </div>
            )}
        </div>
    )
}