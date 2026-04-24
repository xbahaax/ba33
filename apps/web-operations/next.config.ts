import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NEXT_DIST_DIR
    ? { distDir: process.env.NEXT_DIST_DIR }
    : {}),
  transpilePackages: ["@ba33/ui-web", "@ba33/design-tokens"],
};

export default nextConfig;
