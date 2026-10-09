import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // No rewrites: the browser talks DIRECTLY to the API server — the local one
  // in `next dev`, the live one in production. The addresses are defined in
  // exactly one place: `lib/core/env.ts`.
};

export default nextConfig;