'use client'

import { useRef, useState } from 'react'
import { Play, ChefHat, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function VideoCard({ video, currentUserId }: any) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleMouseEnter = () => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => console.log("Autoplay prevented:", error))
      }
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0 
      setIsPlaying(false)
    }
  }

  return (
    // CHANGED: Removed fixed width (w-[260px]) and snap-center. Added w-full.
    <div className="flex flex-col w-full group">
      
      {/* --- 1. VIDEO CONTAINER --- */}
      <div 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden cursor-pointer shadow-lg transform transition-transform duration-300 hover:scale-[1.02]"
      >
        <video
          ref={videoRef}
          src={video.video_url}
          className="w-full h-full object-cover"
          loop
          muted 
          playsInline
        />

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-opacity duration-300">
            <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center border border-white/20">
                <Play fill="white" className="text-white w-5 h-5 ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* --- 2. INFO SECTION --- */}
      <div className="mt-3 flex flex-col gap-2 px-1">
        
        <p className="text-gray-900 max-w-[180px] font-bold text-sm leading-tight line-clamp-2" title={video.caption}>
            {video.caption}
        </p>

        {video.recipes && (
            <Link 
                href={`/recipe/${video.recipes.id}`} 
                className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition w-fit"
            >
                <div className="bg-orange-500/20 p-1 rounded-md">
                    <ChefHat size={12} />
                </div>
                Try this recipe
            </Link>
        )}

        <Link href={`/profile/${video.user_id}`} className="flex items-center gap-2 mt-1 group/author">
             <div className="relative w-6 h-6 rounded-full border border-gray-700 overflow-hidden flex-shrink-0">
                {video.users?.avatar_url ? (
                    <Image 
                        src={video.users.avatar_url} 
                        alt={video.users?.username || "User"} 
                        fill 
                        className="object-cover" 
                    />
                ) : (
                    <User className="w-full h-full p-1 bg-gray-600 text-white" />
                )}
             </div>
             <span className="text-gray-800 text-xs group-hover/author:text-orange-600 transition">
                {video.users?.username || "Unknown Chef"}
             </span>
        </Link>
      </div>
    </div>
  )
}