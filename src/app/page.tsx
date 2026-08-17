import Link from "next/link";
import Image from "next/image";
import { getAdminDb } from "@/lib/firebase-admin";
import { Product, ProductCategory } from "@/lib/products";

const SECTIONS: { key: ProductCategory; label: string; cover?: string }[] = [
  { key: "mens", label: "Men's Shirts", cover: "/grappling-club-mockup.webp" },
  { key: "womens", label: "Women's Shirts", cover: "/just-one-more-round-womens-mockup.webp" },
  { key: "rashguard-mens", label: "Men's Rash Guards" },
  { key: "rashguard-womens", label: "Women's Rash Guards", cover: "/rashguard-cheetah.jpg" },
  { key: "hoodies", label: "Hoodies / Sweatshirts" },
  { key: "kids", label: "Kids" },
  { key: "flags", label: "Flags" },
];

async function getProducts(): Promise<Product[]> {
  try {
    const db = getAdminDb();
    const snap = await db.collection("teedropper_products").orderBy("createdAt", "desc").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
  } catch {
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TeeDropper",
    url: "https://www.teedropper.com",
    logo: "https://www.teedropper.com/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      email: "teedropper@proton.me",
      contactType: "customer support",
    },
  };

  const tiles = SECTIONS.map(({ key, label, cover: staticCover }) => {
    const sectionProducts = products.filter((p) => (p.category ?? "mens") === key);
    const coverImage = staticCover ?? sectionProducts.find((p) => p.image)?.image ?? null;
    return { key, label, coverImage, count: sectionProducts.length };
  }).filter((t) => t.count > 0);

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
    />
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {tiles.map(({ key, label, coverImage }) => (
          <Link
            key={key}
            href={`/category/${key}`}
            className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-gray-900"
          >
            {coverImage && (
              <Image
                src={coverImage}
                alt={label}
                fill
                sizes="(max-width: 640px) 50vw, 480px"
                className="object-cover opacity-70 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                priority
              />
            )}
            <div className="absolute inset-0 flex items-end p-4 sm:p-6">
              <span className="text-white font-black text-xl sm:text-2xl leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}
