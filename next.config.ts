import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' }, 
      { protocol: 'https', hostname: 'image.pollinations.ai' },
    ],
  },
};

export default nextConfig;
