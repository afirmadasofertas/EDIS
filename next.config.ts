import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to THIS project.
  // Without this, Next walks up looking for a package.json / lockfile and may
  // pick ~/package.json (if one exists), then watch the entire home folder.
  outputFileTracingRoot: path.join(__dirname),

  images: {
    // Remote hosts we trust for mock thumbnails during development.
    // Remove picsum.photos once real uploads are wired.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
