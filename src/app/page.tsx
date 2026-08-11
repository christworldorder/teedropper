"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/products";

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setFeatured(data.slice(0, 4)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-black text-white py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6">
            New drops weekly
          </span>
          <h1 className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tight mb-6">
            Viral Tees.<br />
            <span className="text-yellow-400">Right Now.</span>
          </h1>
          <p className="text-white/60 text-lg mb-10">
            The shirts blowing up on X and Facebook. Drop culture for the moment.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-yellow-400 text-black font-black text-lg px-10 py-4 rounded-full hover:bg-yellow-300 transition-colors uppercase tracking-wide"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Ticker */}
      <div className="bg-yellow-400 text-black py-2 overflow-hidden whitespace-nowrap text-sm font-bold tracking-widest uppercase">
        <span>NEW DROP &middot; TRENDING NOW &middot; LIMITED RUN &middot; VIRAL TEES &middot; NEW DROP &middot; TRENDING NOW &middot; LIMITED RUN &middot; VIRAL TEES &middot; NEW DROP &middot; TRENDING NOW &middot; LIMITED RUN &middot; VIRAL TEES &middot;</span>
      </div>

      {/* What We Carry */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">What We Carry</h2>
        <p className="text-gray-500 text-lg leading-relaxed">
          BJJ / MMA &middot; Fitness &middot; Faith &middot; Meme Shirts &middot; Pop Culture &middot; Lifestyle
        </p>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tight">Latest Drops</h2>
            <Link href="/shop" className="text-sm font-bold underline underline-offset-4 hover:text-yellow-500">
              See all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="bg-black text-white py-16 px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black uppercase mb-4">
          Don&apos;t Miss the <span className="text-yellow-400">Next Drop</span>
        </h2>
        <p className="text-white/50 mb-8">Follow us to see what goes viral next.</p>
        <Link
          href="/shop"
          className="inline-block border-2 border-yellow-400 text-yellow-400 font-black px-8 py-3 rounded-full hover:bg-yellow-400 hover:text-black transition-colors uppercase"
        >
          Browse All Tees
        </Link>
      </section>
    </div>
  );
}
