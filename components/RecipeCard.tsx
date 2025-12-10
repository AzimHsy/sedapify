import Image from "next/image";
import Link from "next/link";
import { Heart, Clock, ChefHat, ArrowUpRight } from "lucide-react";

interface RecipeCardProps {
  title: string;
  description: string;
  image: string;
  time: string;
  views: number;
  id: string;
}

export default function RecipeCard({
  title,
  description,
  image,
  time,
  views,
  id,
}: RecipeCardProps) {
  return (
    <div className="bg-white p-3 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
      {/* Image Container */}
      <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition duration-500"
        />
        <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition">
          <Heart size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="px-2 pb-2 flex flex-col">
        <h3 className="font-bold text-xl text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-500 text-xs line-clamp-2 mb-4 h-8">
          {description}
        </p>

        {/* Footer info */}
        <div className="flex items-center justify-between mt-4 ">
          <div className="flex items-center gap-4 text-xs text-gray-600 font-medium">
            <div className="flex items-center gap-1">
              <ChefHat size={14} />
              <span>{views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{time}</span>
            </div>
          </div>

          <Link
            href={`/recipe/${id}`}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-orange-600 transition"
          >
            Try Recipe <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
