"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";
import { Settings, Share2, User, Grid, Heart, Bookmark } from "lucide-react";

interface ProfileViewProps {
  user: any;
  myRecipes: any[];
  savedRecipes: any[];
  likedRecipes: any[];
  totalLikesReceived: number;
}

export default function ProfileView({
  user,
  myRecipes,
  savedRecipes,
  likedRecipes,
  totalLikesReceived,
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<
    "recipes" | "favourites" | "liked"
  >("recipes");

  // Helper to determine which list to show
  const content = {
    recipes: myRecipes,
    favourites: savedRecipes,
    liked: likedRecipes,
  }[activeTab];

  return (
    <div className="max-w-4xl mx-auto pt-8 pb-20 px-4">
      {/* --- HEADER SECTION (TikTok Style) --- */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        {/* Avatar */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
              <User size={40} />
            </div>
          )}
        </div>

        {/* User Info & Stats */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {user.username || "Chef"}
          </h1>
          <p className="text-gray-500 text-sm mb-4">
            @{user.email?.split("@")[0]}
          </p>

          {/* Buttons */}
          <div className="flex gap-2 mb-6">
            <Link
              href="/profile/edit"
              className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
            >
              Edit profile
            </Link>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
              <Share2 size={20} />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
              <Settings size={20} />
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 text-gray-900">
            <div className="flex items-center gap-1">
              <span className="font-bold text-lg">0</span>
              <span className="text-gray-500 text-sm">Following</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-lg">0</span>
              <span className="text-gray-500 text-sm">Followers</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-lg">{totalLikesReceived}</span>
              <span className="text-gray-500 text-sm">Likes</span>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-4 text-gray-700 whitespace-pre-wrap">
            {user.bio || "No bio yet."}
          </p>
        </div>
      </div>

      {/* --- TABS NAVIGATION --- */}
      <div className="flex items-center justify-around border-t border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("recipes")}
          className={`flex items-center gap-2 py-4 px-2 relative transition-colors ${
            activeTab === "recipes"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Grid size={20} />
          <span className="font-semibold text-sm uppercase tracking-wide">
            Your Recipes
          </span>
          {activeTab === "recipes" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab("favourites")}
          className={`flex items-center gap-2 py-4 px-2 relative transition-colors ${
            activeTab === "favourites"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Bookmark size={20} />
          <span className="font-semibold text-sm uppercase tracking-wide">
            Favourites
          </span>
          {activeTab === "favourites" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab("liked")}
          className={`flex items-center gap-2 py-4 px-2 relative transition-colors ${
            activeTab === "liked"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Heart size={20} />
          <span className="font-semibold text-sm uppercase tracking-wide">
            Liked
          </span>
          {activeTab === "liked" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900"></div>
          )}
        </button>
      </div>

      {/* --- GRID CONTENT --- */}
      {content.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.map((recipe: any) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              description={recipe.description}
              image={recipe.image_url || "/placeholder-food.jpg"} // Fallback image
              time={recipe.cooking_time}
              views={0} // Add a view count to your DB later if needed
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            {activeTab === "recipes" && <Grid size={40} />}
            {activeTab === "favourites" && <Bookmark size={40} />}
            {activeTab === "liked" && <Heart size={40} />}
          </div>
          <p className="font-semibold text-lg">No recipes yet</p>
          <p className="text-sm">
            {activeTab === "recipes"
              ? "Upload your first recipe to share with the world."
              : "Interact with posts to see them here."}
          </p>
        </div>
      )}
    </div>
  );
}
