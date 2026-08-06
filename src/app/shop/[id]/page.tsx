import { products } from "@/lib/products";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/shop" className="text-sm font-bold text-gray-500 hover:text-black mb-8 inline-block">
        &larr; Back to Shop
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl text-gray-300">
              👕
            </div>
          )}
          <span className="absolute top-4 left-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            {product.tag}
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-4">{product.name}</h1>
          <p className="text-gray-600 text-lg mb-6">{product.description}</p>
          <div className="text-4xl font-black mb-8">${product.price.toFixed(2)}</div>

          <a
            href={product.stripeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-black text-white text-center font-black text-lg py-4 rounded-full hover:bg-yellow-400 hover:text-black transition-colors uppercase tracking-wide mb-4"
          >
            Buy Now
          </a>
          <p className="text-gray-400 text-sm text-center">
            Secure checkout via Stripe. Ships in 3-5 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
