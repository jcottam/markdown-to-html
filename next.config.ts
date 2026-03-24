import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.VERCEL && { basePath: "/tools/markdown-to-html" }),
};

export default nextConfig;
