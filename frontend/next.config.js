/** @type {import('next').NextConfig} */
// Force build cache invalidation: 2025-11-26-debug-1
const basePath = '/test-devscaffolding';

const nextConfig = {
  basePath,
  assetPrefix: basePath,
  output: 'standalone',
  trailingSlash: false,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
