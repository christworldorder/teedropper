"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, SIZES } from "@/lib/products";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [buying, setBuying] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "teedropper_products", id));
      if (!snap.exists()) {
        setLoading(false);
        return;
      }
      setProduct({ id: snap.id, ...snap.data() } as Product);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleBuy() {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setBuying(true);
    setSizeError(false);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, size: selectedSize }),
      });
      const data = await res.json();
      if (data.url) {
        router.push(data.url);
      } else {
        alert("Something went wrong. Please try again.");
        setBuying(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setBuying(false);
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!product) return notFound();

  const availableSizes = SIZES.filter((s) => product.variants?.[s]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/shop" className="text-sm font-bold text-gray-500 hover:text-black mb-8 inline-block">
        &larr; Back to Shop
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl text-gray-300">👕</div>
          )}
          <span className="absolute top-4 left-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            {product.tag}
          </span>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-4">{product.name}</h1>
          <p className="text-gray-600 text-lg mb-6">{product.description}</p>
          <div className="text-4xl font-black mb-6">${product.price.toFixed(2)}</div>

          {availableSizes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-wide mb-3">
                Select Size {sizeError && <span className="text-red-500 normal-case font-normal ml-2">— Please pick a size</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className={`px-4 py-2 rounded-full border-2 font-bold text-sm transition-colors ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : "border-gray-300 text-gray-700 hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleBuy}
            disabled={buying}
            className="block w-full bg-black text-white text-center font-black text-lg py-4 rounded-full hover:bg-yellow-400 hover:text-black transition-colors uppercase tracking-wide mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {buying ? "Redirecting to checkout..." : "Buy Now"}
          </button>
          <p className="text-gray-400 text-sm text-center">Secure checkout via Stripe. Ships in 3-7 business days.</p>
        </div>
      </div>
    </div>
  );
}
