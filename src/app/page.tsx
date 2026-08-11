"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/products";

function beltLabel(name: string) {
  const match = name.match(/\b(White|Blue|Purple|Brown|Black)\s+Belt\b/i);
  return match ? `${match[1]} Belt` : name;
}

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [igbbmnOpen, setIgbbmnOpen] = useState(false);

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
      {featured.length > 0 && (() => {
        const igbbmnProducts = featured.filter((p) => p.name.toUpperCase().includes("IGBBMN"));
        const otherProducts = featured.filter((p) => !p.name.toUpperCase().includes("IGBBMN"));
        const groupImage = igbbmnProducts[0]?.image;
        const display = igbbmnProducts.length > 0
          ? [{ __igbbmn: true } as unknown as Product, ...otherProducts]
          : otherProducts;
        return (
          <section className="max-w-6xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black uppercase tracking-tight">Latest Drops</h2>
              <Link href="/shop" className="text-sm font-bold underline underline-offset-4 hover:text-yellow-500">
                See all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {display.map((product, i) =>
                (product as unknown as { __igbbmn: boolean }).__igbbmn ? (
                  <div
                    key="igbbmn-group"
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                    onClick={() => setIgbbmnOpen(true)}
                  >
                    <div className="relative bg-gray-100 aspect-square overflow-hidden">
                      {groupImage ? (
                        <Image src={groupImage} alt="IGBBMN" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">👕</div>
                      )}
                      <span className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">New</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">IGBBMN</h3>
                      <p className="text-gray-500 text-sm mt-1">I Got Beat By My Neighbor — pick your belt.</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xl font-black text-gray-900">$29.99</span>
                        <span className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold group-hover:bg-yellow-400 group-hover:text-black transition-colors">Select Belt</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ProductCard key={product.id} product={product} />
                )
              )}
            </div>

            {/* Belt picker modal */}
            {igbbmnOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setIgbbmnOpen(false)}>
                <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Pick Your Belt</h2>
                    <button className="text-3xl font-black leading-none text-gray-400 hover:text-black" onClick={() => setIgbbmnOpen(false)}>&times;</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {igbbmnProducts.map((p) => (
                      <Link key={p.id} href={`/shop/${p.id}`} className="flex items-center gap-4 border-2 border-gray-100 hover:border-black rounded-xl p-3 transition-colors" onClick={() => setIgbbmnOpen(false)}>
                        {p.image && (
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <Image src={p.image} alt={p.name} fill className="object-cover" sizes="56px" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{beltLabel(p.name)}</p>
                          <p className="text-sm text-gray-500">${p.price.toFixed(2)}</p>
                        </div>
                        <span className="ml-auto text-gray-400">&rarr;</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })()}

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
