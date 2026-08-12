"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/products";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
