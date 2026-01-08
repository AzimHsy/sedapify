'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ef4444']

export default function AnalyticsCharts({ categoryData }: { categoryData: any[] }) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      
      {/* Chart 1: Products by Category */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg mb-6 text-gray-800">Inventory Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Static Demo Chart for User Growth */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg mb-6 text-gray-800">User Growth (Demo)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
                { name: 'Mon', users: 4 },
                { name: 'Tue', users: 7 },
                { name: 'Wed', users: 12 },
                { name: 'Thu', users: 20 },
                { name: 'Fri', users: 18 },
                { name: 'Sat', users: 25 },
                { name: 'Sun', users: 30 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f9fafb'}} />
              <Bar dataKey="users" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}