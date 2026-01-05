'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function AdminDashboardCharts({ data }: { data: any[] }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-8">
      
      {/* CHART 1: Sales Trends */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Trends</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => `RM${val}`} />
              
              {/* --- FIX IS APPLIED HERE --- */}
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: any) => [`RM ${Number(value).toFixed(2)}`, 'Revenue']}
              />
              {/* --------------------------- */}

              <Area type="monotone" dataKey="sales" stroke="#f97316" fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: Performance Widget */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Platform Health</h3>
        <p className="text-gray-500 text-sm mb-6">System status and order processing speed</p>
        
        <div className="relative w-48 h-48">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
                <circle cx="96" cy="96" r="88" stroke="#22c55e" strokeWidth="12" fill="transparent" strokeDasharray={552} strokeDashoffset={552 - (552 * 0.98)} strokeLinecap="round" />
             </svg>
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="text-3xl font-bold text-gray-900">98%</span>
                <span className="block text-xs text-gray-400">Uptime</span>
             </div>
        </div>
        <div className="mt-6 flex gap-8">
            <div>
                <span className="block text-2xl font-bold text-gray-900">12ms</span>
                <span className="text-xs text-gray-400">Latency</span>
            </div>
            <div>
                <span className="block text-2xl font-bold text-gray-900">0</span>
                <span className="text-xs text-gray-400">Errors</span>
            </div>
        </div>
      </div>

    </div>
  )
}