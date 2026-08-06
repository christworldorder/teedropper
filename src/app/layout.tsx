import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TeeDropper - Trending Tees Dropped Daily",
  description: "Viral tees for the moment. New drops every week.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main>{children}</main>
        <footer className="bg-black text-white text-center py-8 mt-20 text-sm text-white/50">
          © {new Date().getFullYear()} TeeDropper. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
