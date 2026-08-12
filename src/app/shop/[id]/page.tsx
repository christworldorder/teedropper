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
  return <ProductPageClient id={id} />;
}
