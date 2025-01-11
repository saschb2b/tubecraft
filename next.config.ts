import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["three"],
  experimental: {
    optimizePackageImports: ["three"],
  },
};

export default nextConfig;
