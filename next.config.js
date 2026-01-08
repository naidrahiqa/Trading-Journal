/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable experimental features
  experimental: {
    // Add any experimental features you need
  },

  // Webpack configuration (if needed for path aliases)
  webpack: (config) => {
    return config;
  },
}

module.exports = nextConfig
