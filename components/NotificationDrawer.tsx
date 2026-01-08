'use client'

import { useState, useEffect } from 'react'
import { X, Heart, UserPlus, Bookmark, Loader2, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getNotificationsAction } from '@/app/actions/notificationActions'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      getNotificationsAction()
        .then(data => setNotifications(data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[30] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-[40] bg-white shadow-2xl transition-transform duration-300 ease-out w-full md:w-[400px] flex flex-col md:ml-[256px] border-r border-gray-100
          ${isOpen ? 'translate-x-0' : '-translate-x-[120%]' /* Push off screen */}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {loading ? (
            <div className="flex justify-center py-10 text-gray-400 gap-2">
               <Loader2 className="animate-spin" /> Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20 px-6 opacity-50">
               <Heart size={48} className="mx-auto mb-4 text-gray-300" />
               <p className="text-gray-900 font-bold">No notifications yet</p>
               <p className="text-sm text-gray-500">When people interact with your recipes, you'll see it here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif, i) => (
                <div key={i} className="p-4 hover:bg-orange-50/50 transition flex gap-3 items-start">
                  
                  {/* Icon Badge */}
                  <div className="mt-1">
                    {notif.type === 'like' && <div className="bg-red-100 p-2 rounded-full text-red-500"><Heart size={14} fill="currentColor"/></div>}
                    {notif.type === 'save' && <div className="bg-orange-100 p-2 rounded-full text-orange-600"><Bookmark size={14} fill="currentColor"/></div>}
                    {notif.type === 'follow' && <div className="bg-blue-100 p-2 rounded-full text-blue-600"><UserPlus size={14} /></div>}
                    {notif.type === 'comment' && <div className="bg-green-100 p-2 rounded-full text-green-600"><MessageCircle size={14} fill="currentColor"/></div>}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gray-200 relative overflow-hidden">
                            {notif.actor?.avatar_url && <Image src={notif.actor.avatar_url} alt="" fill className="object-cover" />}
                        </div>
                        <span className="font-bold text-sm text-gray-900">{notif.actor?.username || "Someone"}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600 leading-snug"> {/* <--- Change to <div> */}
                        {notif.type === 'like' && <>liked your recipe <span className="font-semibold text-gray-900">{notif.content?.title}</span></>}
                        {notif.type === 'save' && <>saved your recipe <span className="font-semibold text-gray-900">{notif.content?.title}</span></>}
                        {notif.type === 'follow' && <>started following you.</>}
                        {notif.type === 'comment' && (
                            <>
                                commented on <span className="font-semibold text-gray-900">{notif.content?.title}</span>: 
                                <p className="mt-1 text-gray-500 italic truncate border-l-2 border-gray-300 pl-2">"{notif.extraData}"</p>
                            </>
                        )}
                    </div> 
                    
                    <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notif.date), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Link (if recipe) */}
                  {notif.content && (
                      <Link href={`/recipe/${notif.content.id}`} onClick={onClose} className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden border border-gray-200 hover:opacity-80 transition">
                         {/* We don't have recipe image in the lightweight query, but clicking goes to recipe */}
                         <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] font-bold">VIEW</div>
                      </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}