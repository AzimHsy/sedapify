import Link from "next/link";
import { Search, Globe, ChevronDown, User } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-[140px]">
          <img src="/fyp logo 1.png" alt="Sedapify Logo" />
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
        <Link href="/" className="text-orange-500 font-semibold">
          Home
        </Link>
        <Link href="/generate" className="hover:text-orange-500 transition">
          Generate
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
        <div className="flex items-center gap-1 cursor-pointer hover:text-orange-500">
          Cookbook <ChevronDown size={16} />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Language Selector (Mock) */}
        <button className="flex items-center gap-2 text-gray-600">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/66/Flag_of_Malaysia.svg"
            alt="MY"
            className="w-6 h-4 object-cover rounded shadow-sm"
          />
        </button>

        {/* User Profile */}
        <Link href="/login" className="flex items-center gap-2 pl-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
            {/* Placeholder Avatar */}
            <User className="w-full h-full p-2 text-gray-500" />
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </Link>
      </div>
    </nav>
  );
}
