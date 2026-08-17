import { Metadata } from "next";
import Link from "next/link";
import { getAdminDb } from "@/lib/firebase-admin";
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

async function getProductsByCategory(cat: string): Promise<Product[]> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection("teedropper_products")
      .where("category", "==", cat)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cat: string }>;
}): Promise<Metadata> {
  const { cat } = await params;
  const label = LABELS[cat as ProductCategory] ?? cat;
  return {
    title: `${label} — TeeDropper`,
    description: `Shop ${label} at TeeDropper. Premium gear for fighters, believers, and anyone who trains hard.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ cat: string }>;
}) {
  const { cat } = await params;
  const label = LABELS[cat as ProductCategory] ?? cat;
  const products = await getProductsByCategory(cat);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label} — TeeDropper`,
    description: `Shop ${label} at TeeDropper.`,
    url: `https://www.teedropper.com/category/${cat}`,
    hasPart: products.map((p) => ({
      "@type": "Product",
      name: p.name,
      image: p.image,
      offers: {
        "@type": "Offer",
        price: p.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `https://www.teedropper.com/shop/${p.id}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-yellow-500 hover:text-yellow-400 transition-colors text-sm font-bold">
            ← All Categories
          </Link>
          <span className="text-white/30">/</span>
          <h1 className="text-2xl font-black text-white">{label}</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
