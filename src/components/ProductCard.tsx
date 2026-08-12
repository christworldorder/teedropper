import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
      <Link href={`/shop/${product.id}`}>
        <div className="relative bg-gray-100 aspect-square overflow-hidden">
          {product.image && product.image !== "" ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">
              👕
            </div>
          )}
          <span className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            {product.tag}
          </span>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/shop/${product.id}`}>
          <h3 className="font-bold text-gray-900 text-lg leading-tight hover:text-yellow-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-black text-gray-900">${product.price.toFixed(2)}</span>
          <Link
            href={`/shop/${product.id}`}
            className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-yellow-400 hover:text-black transition-colors"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
}
