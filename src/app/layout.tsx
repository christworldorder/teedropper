import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "TeeDropper - Trending Tees Dropped Daily",
  description: "Viral tees for the moment. New drops every week.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "TeeDropper — Viral Tees. Right Now.",
    description: "The shirts blowing up online. New drops every week. Ships in 3-7 days.",
    url: "https://teedropper.com",
    siteName: "TeeDropper",
    images: [{ url: "https://teedropper.com/og-default.jpg", width: 1200, height: 630, alt: "TeeDropper" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeeDropper — Viral Tees. Right Now.",
    description: "The shirts blowing up online. New drops every week.",
    images: ["https://teedropper.com/og-default.jpg"],
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
        <CartProvider>
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
        </CartProvider>
      </body>
    </html>
  );
}
