"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  User,
  LogOut,
  Settings,
  PlusCircleIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getDisplayName } from "next/dist/shared/lib/utils";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();



  // 5. Added Logic: Fetch user avatar when Navbar loads
  useEffect(() => {
    const getAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (user) {
        const { data } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    };
    getAvatar();
  }, []);


  const getDisplayName = () => {
    if (!user) return "";
    return user.user_metadata?.full_name || user.email || "";
  };

  const getAvatarUrl = () => {
    return avatarUrl || user?.user_metadata?.avatar_url;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAvatarUrl(null);
    router.refresh();
  };

  return (
    <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full relative z-50">
      {/* Logo */}
      <Link href="/" className="flex w-[140px] items-center gap-2 group">
        <img src="/fyp-logo.png" alt="Sedapify" />
      </Link>

      {/* Center Navigation Links */}
      <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
        <Link href="/" className="text-orange-500 font-semibold hover:text-orange-600 transition">
          Home
        </Link>
        <Link href="/discover" className="hover:text-orange-500 transition">
          Discover
        </Link>
        <Link href="/groceries" className="hover:text-orange-500 transition">
          Groceries
        </Link>
        <Link href="/ranking" className="hover:text-orange-500 transition">
          Ranking
        </Link>
        <div className="relative group cursor-pointer flex items-center gap-1 hover:text-orange-500 transition">
          <span>Cookbook</span>
          <ChevronDown size={16} />
          {/* Simple Hover Dropdown for Cookbook */}
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
             <Link href="/cookbook/my-recipes" className="block px-4 py-2 hover:bg-orange-50 rounded-t-xl transition">My Recipes</Link>
             <Link href="/cookbook/saved" className="block px-4 py-2 hover:bg-orange-50 rounded-b-xl transition">Saved</Link>
          </div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        {/* Malaysia Flag */}
        <div className="text-2xl cursor-pointer hover:scale-110 transition-transform">
          🇲🇾
        </div>

        {/* User Dropdown / Sign In */}
        {loading ? (
             <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100 shadow-sm">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-full h-full p-2 text-gray-400" />
                )}
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-600 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-gray-50 mb-2">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <Link
                  href="/recipe/create"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <PlusCircleIcon  size={16} /> Upload Recipe
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User  size={16} /> My Profile
                </Link>

                <Link
                  href="/profile/edit"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings size={16} /> Edit Profile
                </Link>

                <div className="border-t border-gray-50">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition shadow-md hover:shadow-orange-200"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
