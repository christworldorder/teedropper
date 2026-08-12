"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-black text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.png" alt="TeeDropper" width={120} height={120} className="rounded-full" />
        </Link>
        <span className="hidden md:block text-white/50 text-xs font-bold uppercase tracking-widest">Jiu Jitsu &middot; MMA &middot; Faith &middot; Fitness</span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/shop" className="bg-yellow-400 text-black px-5 py-2 rounded-full font-bold hover:bg-yellow-300 transition-colors">
            Shop
          </Link>
        </div>
        <div className="flex md:hidden items-center gap-3">
          <Link href="/shop" className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm">
            Shop
          </Link>
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
          <Link href="/shop" onClick={() => setMenuOpen(false)} className="bg-yellow-400 text-black px-5 py-2 rounded-full font-bold text-center">Shop</Link>
          <Link href="/support" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-yellow-400 px-2 py-1">Support</Link>
          <Link href="/returns" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-yellow-400 px-2 py-1">Returns</Link>
          <Link href="/terms" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-yellow-400 px-2 py-1">Terms</Link>
        </div>
      )}
    </nav>
  );
}
