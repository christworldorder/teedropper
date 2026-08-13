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
      {
        protocol: "https",
        hostname: "teedropper.com",
      },
      {
        protocol: "https",
        hostname: "www.teedropper.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "teedropper",
  project: "javascript-nextjs",
  silent: true,
  telemetry: false,
});
