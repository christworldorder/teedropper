"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product, ProductCategory } from "@/lib/products";

const SECTIONS: { key: ProductCategory; label: string }[] = [
  { key: "mens", label: "Men's" },
  { key: "womens", label: "Women's" },
  { key: "rashguard-mens", label: "Rash Guards - Men's" },
  { key: "rashguard-womens", label: "Rash Guards - Women's" },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  const grouped = SECTIONS.map(({ key, label }) => ({
    label,
    products: products.filter((p) => (p.category ?? "mens") === key),
  })).filter((s) => s.products.length > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {grouped.map(({ label, products: sectionProducts }) => (
        <section key={label}>
          <h2 className="text-2xl font-black text-gray-900 mb-6 pb-2 border-b-2 border-yellow-400">
            {label}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
