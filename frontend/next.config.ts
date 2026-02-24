import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "ec2-35-154-105-102.ap-south-1.compute.amazonaws.com",
        port: "8000",
      },
    ],
  },
};

export default nextConfig;
