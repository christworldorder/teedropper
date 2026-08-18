import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminDb } from "@/lib/firebase-admin";
import { Product } from "@/lib/products";
import ProductPageClient from "./ProductPageClient";

export const dynamic = "force-dynamic";

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
  const description = product.description || `${product.name} — Viral tee from TeeDropper. Ships in 5–10 days.`;
  const image = product.image || "https://www.teedropper.com/og-default.jpg";
  const url = `https://www.teedropper.com/shop/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
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
  if (!product) notFound();

  const sizes: string[] = product?.variants
    ? Object.keys(product.variants)
        .map((k) => (k.includes("-") ? k.split("-")[1] : k))
        .filter((v, i, arr) => arr.indexOf(v) === i)
    : [];

  const schema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || `${product.name} — TeeDropper`,
        image: product.image,
        sku: id,
        brand: { "@type": "Brand", name: "TeeDropper" },
        ...(sizes.length > 0 && { size: sizes }),
        ...(product.color && { color: product.color }),
        ...(product.material && { material: product.material }),
        ...(product.reviewCount != null && product.reviewCount >= 3 && product.avgRating != null
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.avgRating.toFixed(1),
                reviewCount: product.reviewCount,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `https://www.teedropper.com/shop/${id}`,
          seller: { "@type": "Organization", name: "TeeDropper" },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
              transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 5, unitCode: "DAY" },
            },
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "US",
            returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
          },
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
      {/* Server-rendered fit note for crawlers — visually hidden */}
      {sizes.length > 0 && product?.category !== "flags" && (
        <p className="sr-only">
          Sizing: Available in {sizes.join(", ")}. True to size — size up for an oversized fit. Use the Size Guide on this page for exact measurements.
        </p>
      )}
      <ProductPageClient id={id} />
    </>
  );
}
