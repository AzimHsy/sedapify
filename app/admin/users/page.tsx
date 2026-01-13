import { getAdminUsers } from '@/app/actions/adminActions' // Removed updateUserRole import as it's not used here anymore
import { Mail, Calendar, Shield, Truck, Store, User } from 'lucide-react'
import Image from 'next/image'
import AdminUserRoleForm from '@/components/AdminUserRoleForm' // <--- Import the new component

export default async function AdminUsersPage() {
  const users = await getAdminUsers()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Roles & Permissions</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">User</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Current Role</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden">
                      {user.avatar_url && <Image src={user.avatar_url} alt="" fill className="object-cover" /> || <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={18} /></div> }
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="p-4">
                  {/* --- USE THE CLIENT COMPONENT HERE --- */}
                  <AdminUserRoleForm userId={user.id} currentRole={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
    const styles: any = {
        admin: 'bg-black text-white',
        merchant: 'bg-orange-100 text-orange-700',
        driver: 'bg-green-100 text-green-700',
        user: 'bg-gray-100 text-gray-600'
    }
    const icons: any = {
        admin: <Shield size={12} />,
        merchant: <Store size={12} />,
        driver: <Truck size={12} />,
        user: <User size={12} />
    }
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold capitalize ${styles[role] || styles.user}`}>
            {icons[role]} {role}
        </span>
    )
}