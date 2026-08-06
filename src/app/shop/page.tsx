import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function ShopPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tight">All Drops</h1>
        <p className="text-gray-500 mt-2">Trending tees for the moment. Updated weekly.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
