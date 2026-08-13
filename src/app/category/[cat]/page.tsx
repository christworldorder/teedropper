"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Product, ProductCategory } from "@/lib/products";

const LABELS: Record<ProductCategory, string> = {
  mens: "Men's Shirts",
  womens: "Women's Shirts",
  "rashguard-mens": "Men's Rash Guards",
  "rashguard-womens": "Women's Rash Guards",
  hoodies: "Hoodies / Sweatshirts",
  kids: "Kids",
  flags: "Flags",
};

export default function CategoryPage() {
  const { cat } = useParams<{ cat: string }>();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((all: Product[]) =>
        setProducts(all.filter((p) => (p.category ?? "mens") === cat))
      );
  }, [cat]);

  const label = LABELS[cat as ProductCategory] ?? cat;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-500 hover:text-yellow-500 transition-colors text-sm font-medium">
          ← All Categories
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-black text-gray-900">{label}</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
