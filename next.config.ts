import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 75, 85],
    // Product photos uploaded to Supabase Storage
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  // sharp ships native binaries; keep it out of the server bundle
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
