"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/products";

function beltLabel(name: string) {
  const match = name.match(/\b(White|Blue|Purple|Brown|Black)\s+Belt\b/i);
  return match ? `${match[1]} Belt` : name;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [igbbmnOpen, setIgbbmnOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const igbbmnProducts = products.filter((p) => p.name.toUpperCase().includes("IGBBMN"));
  const otherProducts = products.filter((p) => !p.name.toUpperCase().includes("IGBBMN"));
  const groupImage = igbbmnProducts[0]?.image;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tight">All Drops</h1>
        <p className="text-gray-500 mt-2">Trending tees for the moment. Updated weekly.</p>
      </div>
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-lg">Loading drops...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-lg">No drops yet. Check back soon.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* IGBBMN group card */}
          {igbbmnProducts.length > 0 && (
            <div
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => setIgbbmnOpen(true)}
            >
              <div className="relative bg-gray-100 aspect-square overflow-hidden">
                {groupImage ? (
                  <Image
                    src={groupImage}
                    alt="IGBBMN"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">👕</div>
                )}
                <span className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                  New
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">IGBBMN</h3>
                <p className="text-gray-500 text-sm mt-1">I Got Beat By My Neighbor — pick your belt.</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-black text-gray-900">$29.99</span>
                  <span className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                    Select Belt
                  </span>
                </div>
              </div>
            </div>
          )}

          {otherProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Belt picker modal */}
      {igbbmnOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIgbbmnOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight">Pick Your Belt</h2>
              <button
                className="text-3xl font-black leading-none text-gray-400 hover:text-black"
                onClick={() => setIgbbmnOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {igbbmnProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.id}`}
                  className="flex items-center gap-4 border-2 border-gray-100 hover:border-black rounded-xl p-3 transition-colors"
                  onClick={() => setIgbbmnOpen(false)}
                >
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
    </div>
  );
}
