import { getAdminUsers } from '@/app/actions/adminActions'
import { Mail, Calendar, Shield } from 'lucide-react'
import Image from 'next/image'

export default async function AdminUsersPage() {
  const users = await getAdminUsers()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">User</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Contact</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Role</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden border border-gray-100">
                      {user.avatar_url && <Image src={user.avatar_url} alt="" fill className="object-cover" />}
                    </div>
                    <span className="font-bold text-gray-900">{user.username || 'No Name'}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} /> {user.email}
                  </div>
                </td>
                <td className="p-4">
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 bg-black text-white px-2 py-1 rounded-md text-xs font-bold">
                      <Shield size={12} /> Admin
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">
                      User
                    </span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} /> {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}