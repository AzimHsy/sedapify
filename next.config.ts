import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Images Configuration
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
        hostname: "ykkwcayqokxspqmicidt.supabase.co",
      },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' }, 
      { protocol: 'https', hostname: 'image.pollinations.ai' },
    ],
  },

  // 2. Server Actions Limit (Must be OUTSIDE of 'images')
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // This allows large video uploads
    },
  },
};

export default nextConfig;