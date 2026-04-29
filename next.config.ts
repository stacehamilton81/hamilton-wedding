import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is the only line we need to fix the "Blocked cross-origin" error
  allowedDevOrigins: ['192.168.0.172'],
};

export default nextConfig;