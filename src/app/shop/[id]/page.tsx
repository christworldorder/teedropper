import { Metadata } from "next";
import { getAdminDb } from "@/lib/firebase-admin";
import { Product } from "@/lib/products";
import ProductPageClient from "./ProductPageClient";

async function getProduct(id: string): Promise<Product | null> {
  try {
    const db = getAdminDb();
    const doc = await db.collection("teedropper_products").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Product;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Product Not Found — TeeDropper" };
  }

  const title = `${product.name} — TeeDropper`;
  const description = product.description || `${product.name} — Viral tee from TeeDropper. Ships in 3-7 days.`;
  const image = product.image || "https://teedropper.com/og-default.jpg";
  const url = `https://teedropper.com/shop/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "TeeDropper",
      images: [{ url: image, width: 800, height: 800, alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  const schema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || `${product.name} — TeeDropper`,
        image: product.image,
        brand: { "@type": "Brand", name: "TeeDropper" },
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `https://www.teedropper.com/shop/${id}`,
          seller: { "@type": "Organization", name: "TeeDropper" },
        },
      }
    : null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <ProductPageClient id={id} />
    </>
  );
}
