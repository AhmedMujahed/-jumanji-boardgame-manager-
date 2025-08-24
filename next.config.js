/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  // Ensure Next.js treats this folder as the workspace root
  outputFileTracingRoot: path.join(__dirname),
  // Enable static exports if needed
  // output: 'standalone', // Commented out for Vercel compatibility
  // Custom webpack config for better performance
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom webpack configurations can go here
    return config;
  }
}

module.exports = nextConfig
