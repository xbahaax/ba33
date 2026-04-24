import type { NextConfig } from "next";

function resolveApiProxyTarget() {
  const candidates = [
    process.env.BA33_API_URL,
    process.env.NEXT_PUBLIC_BA33_API_URL,
    "http://127.0.0.1:3100",
  ];

  const absoluteTarget =
    candidates.find((candidate) => candidate && /^https?:\/\//.test(candidate)) ??
    "http://127.0.0.1:3100";

  const trimmedTarget = absoluteTarget.replace(/\/$/, "");
  return trimmedTarget.endsWith("/api/v1")
    ? trimmedTarget
    : `${trimmedTarget}/api/v1`;
}

const apiProxyTarget = resolveApiProxyTarget();

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
