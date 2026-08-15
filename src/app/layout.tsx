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
      <head>
        {/* Meta Pixel */}
        <script dangerouslySetInnerHTML={{ __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','946085798523529');
          fbq('track','PageView');
        `}} />
        <noscript dangerouslySetInnerHTML={{ __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=946085798523529&ev=PageView&noscript=1"/>` }} />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <CartProvider>
          {/* Promo announcement bar */}
          <div className="bg-yellow-400 text-black text-xs sm:text-sm font-black uppercase tracking-widest text-center py-2.5 px-4">
            🔥 Buy 2+ Save 10%&nbsp;&nbsp;·&nbsp;&nbsp;Free Shipping Over $100&nbsp;&nbsp;·&nbsp;&nbsp;Ships in 3–7 Days
          </div>
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
