import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/api/image/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/api/image/**',
      },
      // For production, add your actual domain
      // {
      //   protocol: 'https',
      //   hostname: 'your-domain.com',
      //   pathname: '/api/image/**',
      // },
    ],
  },
};

export default nextConfig;
