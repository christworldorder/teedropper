import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

// Maps internal category slugs to Meta-friendly Google product categories
const CATEGORY_MAP: Record<string, string> = {
  mens: "Apparel & Accessories > Clothing > Shirts & Tops",
  womens: "Apparel & Accessories > Clothing > Shirts & Tops",
  hoodies: "Apparel & Accessories > Clothing > Outerwear",
  "rashguard-mens": "Apparel & Accessories > Clothing > Activewear",
  "rashguard-womens": "Apparel & Accessories > Clothing > Activewear",
  kids: "Apparel & Accessories > Clothing > Baby & Toddler Clothing",
  flags: "Home & Garden > Decor > Flags & Pennants",
};

const GENDER_MAP: Record<string, string> = {
  mens: "male",
  womens: "female",
  hoodies: "unisex",
  "rashguard-mens": "male",
  "rashguard-womens": "female",
  kids: "unisex",
  flags: "unisex",
};

const AGE_MAP: Record<string, string> = {
  kids: "kids",
};

export async function GET() {
  const db = getAdminDb();
  const snap = await db.collection("teedropper_products").get();

  const items: Record<string, string>[] = [];

  for (const doc of snap.docs) {
    const p = doc.data();
    const productId = doc.id;
    const price = `${Number(p.price).toFixed(2)} USD`;
    const productUrl = `https://www.teedropper.com/product/${productId}`;
    const category = p.category || "mens";
    const googleCategory = CATEGORY_MAP[category] || "Apparel & Accessories > Clothing";
    const gender = GENDER_MAP[category] || "unisex";
    const ageGroup = AGE_MAP[category] || "adult";

    const variants: Record<string, string> = p.variants || {};
    const sizes = Object.keys(variants);

    if (sizes.length === 0) continue;

    // One entry per size variant
    for (const size of sizes) {
      const variantId = variants[size];
      items.push({
        id: `${productId}_${size.replace(/\s+/g, "_")}`,
        title: sizes.length === 1 || size === "One Size"
          ? p.name
          : `${p.name} - ${size}`,
        description: p.description || p.name,
        availability: "in stock",
        condition: "new",
        price,
        link: productUrl,
        image_link: p.image || "",
        brand: "TeeDropper",
        google_product_category: googleCategory,
        gender,
        age_group: ageGroup,
        size: size === "One Size" ? "One Size" : size,
        item_group_id: productId,
        // Printful variant ID -- useful for catalog matching later
        custom_label_0: variantId,
      });
    }
  }

  const feed = {
    version: "2.0",
    items,
  };

  return NextResponse.json(feed, {
    headers: {
      "Content-Type": "application/json",
      // Allow Meta's crawler to access the feed
      "Access-Control-Allow-Origin": "*",
      // Cache for 1 hour
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
