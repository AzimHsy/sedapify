'use client'

import { updateUserRole } from '@/app/actions/adminActions'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function AdminUserRoleForm({ userId, currentRole }: { userId: string, currentRole: string }) {
  const [loading, setLoading] = useState(false)

  // Trigger server action immediately when changed
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true)
    const newRole = e.target.value
    await updateUserRole(userId, newRole)
    setLoading(false)
  }

  return (
    <div className="relative w-full max-w-[140px]">
        <select 
            disabled={loading}
            defaultValue={currentRole}
            onChange={handleChange}
            className={`w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2.5 pr-8 focus:ring-orange-500 focus:border-orange-500 cursor-pointer appearance-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <option value="user">Customer</option>
            <option value="driver">Driver</option>
            <option value="merchant">Merchant</option>
            <option value="admin">Admin</option>
        </select>
        
        {/* Loading Spinner or Arrow */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            )}
        </div>
    </div>
  )
}