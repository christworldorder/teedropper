"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, openDrawer } = useCart();

  return (
    <>
      <nav className="bg-[#1e2a14] text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="TeeDropper" width={120} height={120} className="rounded-full" />
          </Link>
          <span className="hidden md:block text-white/50 text-xs font-bold uppercase tracking-widest">Jiu Jitsu &middot; MMA &middot; Faith &middot; Fitness</span>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            {/* Cart icon */}
            <button
              onClick={openDrawer}
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} item${cartCount !== 1 ? "s" : ""}` : ""}`}
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-black text-xs font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>
          <div className="flex md:hidden items-center gap-3">
            {/* Mobile cart icon */}
            <button
              onClick={openDrawer}
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} item${cartCount !== 1 ? "s" : ""}` : ""}`}
              className="relative p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-black text-xs font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <div className="space-y-1.5">
                <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </div>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 flex flex-col gap-3 text-sm font-medium border-t border-white/10 pt-4">
            <Link href="/" onClick={() => setMenuOpen(false)} className="bg-yellow-400 text-black px-5 py-2 rounded-full font-bold text-center">Home</Link>
            <Link href="/support" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-yellow-400 px-2 py-1">Support</Link>
            <Link href="/returns" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-yellow-400 px-2 py-1">Returns</Link>
            <Link href="/terms" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-yellow-400 px-2 py-1">Terms</Link>
          </div>
        )}
      </nav>
      <CartDrawer />
    </>
  );
}
