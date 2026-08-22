import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    // The question bank is a large JSON module loaded on the server only.
    largePageDataBytes: 512 * 1024,
  },
};

export default nextConfig;
