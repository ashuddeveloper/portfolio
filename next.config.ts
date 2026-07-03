import type { NextConfig } from "next";

/**
 * Static export — the same build deploys unchanged to GitHub Pages, Vercel,
 * and Netlify. For sub-directory hosting (GitHub project pages) set
 * NEXT_PUBLIC_BASE_PATH="/repo-name" at build time; the included GitHub
 * Actions workflow does this automatically.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(basePath ? { basePath } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
