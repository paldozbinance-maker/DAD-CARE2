import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  // Compress responses — reduces bandwidth on Netlify free tier
  compress: true,

  // Reduce image optimization function calls on Netlify
  images: {
    unoptimized: true, // No Netlify Image CDN costs — app uses avatars not heavy images
  },

  // Silence workspace root warning
  turbopack: {
    root: __dirname,
  },

  // Reduce bundle size by removing server-side source maps in production
  productionBrowserSourceMaps: false,
};

export default nextConfig;
