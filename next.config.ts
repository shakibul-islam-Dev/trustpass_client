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
  // No rewrites: the browser talks DIRECTLY to the Live API.
  // The Live API's address is defined in exactly one place:
  // `lib/core/api-url.ts`.
};

export default nextConfig;