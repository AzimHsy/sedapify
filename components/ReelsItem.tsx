'use client'

import { useRef, useState, useEffect } from 'react'
import { Heart, Bookmark, MessageCircle, Share2, ChefHat, User, Play, Volume2, VolumeX } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toggleVideoLike, toggleVideoSave } from '@/app/actions/videoActions'

export default function ReelsItem({ video, currentUserId }: any) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false) // New state

  // Toggle Play/Pause on click
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = (e: any) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleLike = () => {
    if(!currentUserId) return alert("Login to like")
    setIsLiked(!isLiked)
    toggleVideoLike(video.id)
  }

  const handleSave = () => {
    if(!currentUserId) return alert("Login to save")
    setIsSaved(!isSaved)
    toggleVideoSave(video.id)
  }

  // Auto-play when element comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
          } else {
            videoRef.current?.pause()
            setIsPlaying(false)
          }
        })
      },
      { threshold: 0.6 }
    )

    if (videoRef.current) observer.observe(videoRef.current)
    return () => observer.disconnect()
  }, [])

  // Check if caption is long (more than 100 characters)
  const isLongCaption = video.caption && video.caption.length > 100

  return (
    <div className="relative w-full h-[calc(100vh-20px)] md:h-[calc(100vh-40px)] snap-start flex justify-center py-4">
      
      {/* Container restricted width for desktop, full for mobile */}
      <div className="relative w-full md:w-[450px] h-full bg-black rounded-xl overflow-hidden shadow-2xl group">
        
        {/* VIDEO */}
        <video
          ref={videoRef}
          src={video.video_url}
          className="w-full h-full object-cover cursor-pointer"
          loop
          playsInline
          onClick={togglePlay}
        />

        {/* Play Icon Overlay (When Paused) */}
        {!isPlaying && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
              <Play size={64} className="text-white/80 fill-white/80" />
           </div>
        )}

        {/* Mute Toggle (Top Right) */}
        <button onClick={toggleMute} className="absolute top-4 right-4 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition z-10">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        {/* --- BOTTOM INFO SECTION --- */}
        <div className="absolute bottom-0  left-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-20">
            
            {/* User Info */}
            <div className="flex items-center gap-3 mb-3">
                <Link href={`/profile/${video.user_id}`} className="relative w-10 h-10 rounded-full border border-white overflow-hidden">
                    {video.users?.avatar_url ? (
                        <Image src={video.users.avatar_url} alt="User" fill className="object-cover" />
                    ) : (
                        <User className="w-full h-full p-2 bg-gray-600 text-white" />
                    )}
                </Link>
                <Link href={`/profile/${video.user_id}`} className="text-white font-normal hover:underline shadow-black drop-shadow-md">
                    @{video.users?.username}
                </Link>
            </div>

            {/* Caption with Expand/Collapse */}
            <div className="text-white text-sm mb-4 max-w-[350px]">
                <p className={`drop-shadow-md ${isCaptionExpanded ? '' : 'line-clamp-2'}`}>
                    {video.caption} <span className="text-gray-300">#sedapify #cooking</span>
                </p>
                {isLongCaption && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsCaptionExpanded(!isCaptionExpanded)
                        }}
                        className="text-gray-300 hover:text-white font-semibold mt-1 transition"
                    >
                        {isCaptionExpanded ? 'Show less' : 'more...'}
                    </button>
                )}
            </div>

            {/* Linked Recipe Button (Glassmorphism) */}
            {video.recipes && (
                <Link 
                    href={`/recipe/${video.recipes.id}`}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/30 transition w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-orange-500 p-1 rounded">
                        <ChefHat size={14} className="text-white" />
                    </div>
                    <span className="truncate">Try Recipe: {video.recipes.title}</span>
                </Link>
            )}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-48 right-4 flex flex-col gap-6 items-center">
            <ActionBtn icon={<Heart size={28} className={isLiked ? "fill-red-500 text-red-500" : "text-white"} />} label="Like" onClick={handleLike} />
            <ActionBtn icon={<MessageCircle size={28} className="text-white" />} label="Comment" />
            <ActionBtn icon={<Bookmark size={28} className={isSaved ? "fill-orange-500 text-orange-500" : "text-white"} />} label="Save" onClick={handleSave} />
        </div>
      </div>
    </div>
  )
}

// Helper for the right-side buttons
function ActionBtn({ icon, onClick }: any) {
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-1 group">
            <div className="p-3 bg-black/40 rounded-full hover:bg-black/60 transition backdrop-blur-sm">
                {icon}
            </div>
        </button>
    )
}