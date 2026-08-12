import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["firebase", "@firebase/app", "@firebase/firestore", "@firebase/storage", "@firebase/auth", "@firebase/util", "@firebase/component", "@firebase/logger"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "files.cdn.printful.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
});
