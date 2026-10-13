import type { NextConfig } from "next";

const apiServerUrl = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://trust-pass-server.vercel.app"
    : "http://localhost:5000")
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
