import type { NextConfig } from "next";

const apiProxyTarget = (
  process.env.BA33_API_URL ??
  process.env.NEXT_PUBLIC_BA33_API_URL ??
  "http://127.0.0.1:3001"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  ...(process.env.NEXT_DIST_DIR
    ? { distDir: process.env.NEXT_DIST_DIR }
    : {}),
  transpilePackages: ["@ba33/ui-web", "@ba33/design-tokens"],
  async rewrites() {
    return [
      {
        source: "/_ba33_api/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
