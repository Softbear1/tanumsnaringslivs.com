import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tflrdlyquvndapjwnccu.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async rewrites() {
    return [
      // Serve the static /sommarjobb shell for all job detail URLs.
      // Client JS reads usePathname() to extract the job id.
      { source: "/sommarjobb/:id", destination: "/sommarjobb" },
      // Same for employer job form/edit.
      { source: "/arbetsgivare/annons/:id", destination: "/arbetsgivare" },
    ];
  },
};

if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

export default nextConfig;
