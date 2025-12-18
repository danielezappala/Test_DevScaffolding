/** @type {import('next').NextConfig} */
// Force build cache invalidation: 2025-11-26-debug-1
const isDev = process.env.NODE_ENV !== 'production';
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH !== undefined
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : isDev
      ? ''
      : '/inventory';
const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || basePath || undefined;

const nextConfig = {
  basePath,
  assetPrefix,
  output: 'standalone',
  trailingSlash: false,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
