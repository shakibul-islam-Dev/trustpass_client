import type { NextConfig } from "next";

const apiServerUrl = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "https://trust-pass-server.vercel.app"
).replace(/\/$/, "");

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
  // Keep browser API calls same-origin so session cookies are first-party.
  // Server-side code uses the absolute URL from lib/core/env.ts directly.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiServerUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
