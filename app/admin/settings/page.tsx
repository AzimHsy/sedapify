import { Save, Bell, Lock, Globe } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Settings</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        
        {/* General */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Globe size={20} /></div>
            <h3 className="font-bold text-gray-900">General</h3>
          </div>
          <div className="flex items-center justify-between mb-4">
             <span className="text-gray-700">Maintenance Mode</span>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
             </label>
          </div>
          <p className="text-xs text-gray-400">Enabling this will hide the app for non-admin users.</p>
        </div>

        {/* Notifications */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Bell size={20} /></div>
            <h3 className="font-bold text-gray-900">Notifications</h3>
          </div>
          <div className="flex items-center justify-between">
             <span className="text-gray-700">Email Alerts on New Orders</span>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
             </label>
          </div>
        </div>

        {/* Security */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Lock size={20} /></div>
            <h3 className="font-bold text-gray-900">Security</h3>
          </div>
          <button className="text-sm font-bold text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition">
            Reset Admin Password
          </button>
        </div>

        <div className="p-6 bg-gray-50 flex justify-end">
          <button className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition">
            <Save size={18} /> Save Changes
          </button>
        </div>

      </div>
    </div>
  )
}