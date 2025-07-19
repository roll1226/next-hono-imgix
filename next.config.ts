import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // PPR (Partial Prerendering) を無効化してリアルタイムデータを確保
    ppr: false,
  },
  // API routesでキャッシュを無効化
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
