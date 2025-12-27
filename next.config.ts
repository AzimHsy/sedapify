import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Keep Unsplash for dummy data
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        // This is your specific Supabase Storage URL from the error message
        hostname: "ykkwcayqokxspqmicidt.supabase.co",
      },
    ],
  },
};

export default nextConfig;
