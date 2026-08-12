import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TeeDropper - Trending Tees Dropped Daily",
  description: "Viral tees for the moment. New drops every week.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
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
        <footer className="bg-black text-white py-10 mt-20 text-sm text-white/50">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>© {new Date().getFullYear()} TeeDropper. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="/support" className="hover:text-white transition-colors">Support</a>
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="/returns" className="hover:text-white transition-colors">Returns</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
