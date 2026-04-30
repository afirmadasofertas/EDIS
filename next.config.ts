import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to THIS project.
  // Without this, Next walks up looking for a package.json / lockfile and may
  // pick ~/package.json (if one exists), then watch the entire home folder.
  outputFileTracingRoot: path.join(__dirname),

  images: {
    remotePatterns: [
      // Mock thumbnails — kept for legacy fixtures.
      { protocol: "https", hostname: "picsum.photos" },
      // Supabase Storage objects (signed URLs from the drive-files bucket).
      // *.supabase.co covers every Supabase project we may use.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/**" },
    ],
  },
};

export default nextConfig;
