'use client'

import { X, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FollowListModalProps {
  userId: string
  type: 'followers' | 'following'
  onClose: () => void
}

export default function FollowListModal({ userId, type, onClose }: FollowListModalProps) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUsers = async () => {
      const isFollowers = type === 'followers'

      // Step 1: Get the follow relationships
      const { data: followData } = await supabase
        .from('follows')
        .select('follower_id, following_id')
        .eq(isFollowers ? 'following_id' : 'follower_id', userId)

      if (!followData || followData.length === 0) {
        setUsers([])
        setLoading(false)
        return
      }

      // Step 2: Extract user IDs
      const userIds = followData.map((f: any) => 
        isFollowers ? f.follower_id : f.following_id
      )

      // Step 3: Fetch user details
      const { data: userDetails } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .in('id', userIds)

      setUsers(userDetails || [])
      setLoading(false)
    }
    
    // Lock scroll
    document.body.style.overflow = 'hidden'
    fetchUsers()
    
    return () => { 
      document.body.style.overflow = 'unset' 
    }
  }, [userId, type, supabase])

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[70vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg capitalize">{type}</h3>
          <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No users found.</div>
          ) : (
            users.map(u => (
              <Link 
                key={u.id} 
                href={`/profile/${u.id}`} 
                onClick={onClose}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
                  {u.avatar_url ? (
                    <Image src={u.avatar_url} alt={u.username} fill className="object-cover" />
                  ) : (
                    <User className="p-2 w-full h-full text-gray-400" />
                  )}
                </div>
                <span className="font-bold text-gray-800">{u.username}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}