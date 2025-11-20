/** @type {import('next').NextConfig} */
const basePath = '/test-devscaffolding';

const nextConfig = {
  output: 'standalone',
basePath: basePath,
  assetPrefix: basePath,
// Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BASE_PATH: basePath,
  },

  // Rewrites for API proxy (optional, for development)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
