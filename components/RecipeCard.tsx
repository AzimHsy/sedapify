import Image from 'next/image'
import Link from 'next/link'
import { Heart, Clock, ArrowUpRight, User } from 'lucide-react'

interface RecipeCardProps {
  id: string
  title: string
  description: string
  image: string
  time: string
  views: number
  author?: string
  authorAvatar?: string 
}

export default function RecipeCard({ id, title, description, image, time, views, author, authorAvatar }: RecipeCardProps) {
  return (
    <div className="bg-white p-3 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100">
      
      {/* Image Container */}
      <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-3">
        <Image 
          src={image || '/placeholder-food.jpg'} 
          alt={title} 
          fill 
          className="object-cover group-hover:scale-105 transition duration-500" 
        />
        <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition">
          <Heart size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="px-2 pb-2 flex flex-col flex-grow">

        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1 leading-tight">{title}</h3>
        <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-grow">{description}</p>
        
        {/* Footer info */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 gap-3">
          
          {/* Author Avatar & Name Row */}
          {/* Added 'min-w-0' to allow truncation to work inside flex */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
              {authorAvatar ? (
                <Image src={authorAvatar} alt={author || "Chef"} fill className="object-cover" />
              ) : (
                <User className="w-full h-full p-1 text-gray-400" />
              )}
            </div>
            {/* Truncate ensures it cuts off with '...' */}
            <span className="text-sm font-normal text-gray-600 truncate">
              {author || "Anonymous Chef"}
            </span>
          </div>

          {/* Added 'shrink-0' so the button never gets squished */}
          <Link 
            href={`/recipe/${id}`}
            className="flex-shrink-0 flex items-center gap-1 bg-black text-white px-4 py-2 rounded-full text-sm font-normal hover:bg-orange-600 transition"
          >
            Try Recipe <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}