import type { NextConfig } from "next";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  output: isCapacitorBuild ? 'export' : undefined,
  distDir: isCapacitorBuild ? 'out' : undefined,

  // Allow cross-origin requests from 127.0.0.1 during local development
  allowedDevOrigins: ["http://127.0.0.1", "http://127.0.0.1:3000"],

  // Performance optimizations
  experimental: {
    // Tree-shake icon libraries and animation libraries
    optimizePackageImports: ["lucide-react", "framer-motion", "@clerk/nextjs"],
  },
  compiler: {
    // Remove console.log in production for cleaner output
    removeConsole: process.env.NODE_ENV === "production",
  },

  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  trailingSlash: isCapacitorBuild ? true : false,
  skipProxyUrlNormalize: true,
  images: {
    dangerouslyAllowSVG: false,
    unoptimized: process.env.CAPACITOR_BUILD === 'true',
    formats: ["image/avif", "image/webp"],
    // Device sizes optimized for common breakpoints
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/dc127wztz/**" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
  compress: true,
  poweredByHeader: false,
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    if (config.output) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      };
    }
    // Capacitor builds: replace @clerk/nextjs with no-op shim to avoid server actions
    if (isCapacitorBuild) {
      const shimPath = require('path').resolve(__dirname, 'lib/clerk-cap-shim.tsx');
      const serverShimPath = require('path').resolve(__dirname, 'lib/clerk-cap-server-shim.ts');
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        '@clerk/nextjs/server': serverShimPath,
        '@clerk/nextjs': shimPath,
      };
    }
    return config;
  },
};

export default nextConfig;
