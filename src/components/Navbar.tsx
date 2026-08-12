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
          <Image src="/logo.png" alt="TeeDropper" width={80} height={80} className="rounded-full" />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/shop" className="hover:text-yellow-400 transition-colors">Shop</Link>
          <Link href="/shop" className="bg-yellow-400 text-black px-5 py-2 rounded-full font-bold hover:bg-yellow-300 transition-colors">
            New Drops
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
        <div className="md:hidden px-4 pb-4 flex flex-col gap-4 text-sm font-medium border-t border-white/10 pt-4">
          <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link href="/shop" onClick={() => setMenuOpen(false)} className="bg-yellow-400 text-black px-5 py-2 rounded-full font-bold text-center">
            New Drops
          </Link>
        </div>
      )}
    </nav>
  );
}
