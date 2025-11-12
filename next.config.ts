import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wprs.my-hobby.space",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
