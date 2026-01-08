import { getAdminVideos, deleteVideo } from '@/app/actions/adminActions'
import { Trash2, ChefHat, Play } from 'lucide-react'

export default async function AdminVideosPage() {
  const videos = await getAdminVideos()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Video Content</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video: any) => (
          <div key={video.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 group">
            {/* Video Preview */}
            <div className="relative w-full aspect-[9/16] bg-black rounded-xl overflow-hidden mb-4">
              <video src={video.video_url} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="text-white opacity-50" size={32} fill="currentColor" />
              </div>
            </div>

            {/* Info */}
            <div className="mb-4">
              <p className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">{video.caption}</p>
              <p className="text-xs text-gray-500">By @{video.users?.username}</p>
              
              {video.recipes && (
                <div className="mt-2 flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit">
                  <ChefHat size={12} />
                  <span className="truncate max-w-[150px]">{video.recipes.title}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <form action={async () => {
              'use server'
              await deleteVideo(video.id)
            }}>
              <button className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition">
                <Trash2 size={16} /> Delete Video
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}