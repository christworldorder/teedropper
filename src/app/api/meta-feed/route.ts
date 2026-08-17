import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATEGORY_MAP: Record<string, string> = {
  mens:              "Apparel & Accessories > Clothing > Shirts & Tops",
  womens:            "Apparel & Accessories > Clothing > Shirts & Tops",
  hoodies:           "Apparel & Accessories > Clothing > Outerwear",
  "rashguard-mens":  "Apparel & Accessories > Clothing > Activewear",
  "rashguard-womens":"Apparel & Accessories > Clothing > Activewear",
  kids:              "Apparel & Accessories > Clothing > Activewear",
  flags:             "Home & Garden > Decor > Flags & Windsocks",
};

const PRODUCT_TYPE_MAP: Record<string, string> = {
  mens:              "Apparel > T-Shirts",
  womens:            "Apparel > Women's T-Shirts",
  hoodies:           "Apparel > Hoodies & Sweatshirts",
  "rashguard-mens":  "Activewear > Rash Guards > Men's",
  "rashguard-womens":"Activewear > Rash Guards > Women's",
  kids:              "Activewear > Rash Guards > Kids",
  flags:             "Accessories > Flags",
};

const GENDER_MAP: Record<string, string> = {
  mens:              "male",
  womens:            "female",
  hoodies:           "unisex",
  "rashguard-mens":  "male",
  "rashguard-womens":"female",
  kids:              "unisex",
  flags:             "unisex",
};

// Toddler sizes get their own category + age_group
const TODDLER_SIZES = new Set(["2T", "3T", "4T", "5T"]);

function slug(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function sizeCategory(category: string, size: string) {
  if (category !== "kids") return null;
  return TODDLER_SIZES.has(size)
    ? { google_product_category: "Apparel & Accessories > Clothing > Baby & Toddler Clothing", age_group: "toddler", product_type: "Activewear > Rash Guards > Toddler" }
    : { google_product_category: "Apparel & Accessories > Clothing > Activewear", age_group: "kids", product_type: "Activewear > Rash Guards > Kids" };
}

export async function GET() {
  const db = getAdminDb();
  const snap = await db.collection("teedropper_products").get();

  const items: Record<string, string | number>[] = [];

  for (const doc of snap.docs) {
    const p = doc.data();
    const docId = doc.id;
    const price = `${Number(p.price).toFixed(2)} USD`;
    const productUrl = `https://www.teedropper.com/shop/${docId}`;
    const category = p.category || "mens";
    const googleCategory = CATEGORY_MAP[category] || "Apparel & Accessories > Clothing";
    const productType = PRODUCT_TYPE_MAP[category] || "Apparel";
    const gender = GENDER_MAP[category] || "unisex";
    const isFlag = category === "flags";
    const niche: string = p.niche || category;

    const variants: Record<string, string> = p.variants || {};
    const variantKeys = Object.keys(variants);
    if (variantKeys.length === 0) continue;

    const hasColorInKey = variantKeys.some((k) => k.includes("-"));

    const additionalImages: string[] = Array.isArray(p.additionalImages) ? p.additionalImages : [];

    if (isFlag) {
      items.push({
        id: `${docId}-one-size`,
        title: p.name,
        description: p.description || p.name,
        availability: "in stock",
        condition: "new",
        price,
        link: productUrl,
        image_link: p.image || "",
        brand: "TeeDropper",
        google_product_category: googleCategory,
        product_type: productType,
        ...(p.color && { color: p.color }),
        ...(p.material && { material: p.material }),
        ...(additionalImages[0] && { additional_image_link: additionalImages[0] }),
        item_group_id: docId,
        custom_label_0: niche,
        mpn: variants[variantKeys[0]] || "",
      });
      continue;
    }

    if (hasColorInKey) {
      for (const key of variantKeys) {
        const dashIdx = key.indexOf("-");
        const color = key.slice(0, dashIdx);
        const size = key.slice(dashIdx + 1);
        const image = (p.colorImages && p.colorImages[color]) || p.image || "";
        const sizeOverrides = sizeCategory(category, size);

        items.push({
          id: `${docId}-${slug(color)}-${slug(size)}`,
          title: `${p.name} - ${color} / ${size}`,
          description: p.description || p.name,
          availability: "in stock",
          condition: "new",
          price,
          link: `${productUrl}?color=${encodeURIComponent(color)}&size=${encodeURIComponent(size)}`,
          image_link: image,
          brand: "TeeDropper",
          google_product_category: sizeOverrides?.google_product_category ?? googleCategory,
          product_type: sizeOverrides?.product_type ?? productType,
          gender,
          age_group: sizeOverrides?.age_group ?? "adult",
          color,
          size,
          ...(p.material && { material: p.material }),
          ...(additionalImages[0] && { additional_image_link: additionalImages[0] }),
          item_group_id: docId,
          custom_label_0: niche,
          mpn: variants[key],
        });
      }
    } else {
      const color: string = p.color || "Black";
      const image = (p.colorImages && p.colorImages[color]) || p.image || "";

      for (const size of variantKeys) {
        const sizeOverrides = sizeCategory(category, size);

        items.push({
          id: `${docId}-${slug(color)}-${slug(size)}`,
          title: `${p.name} - ${size}`,
          description: p.description || p.name,
          availability: "in stock",
          condition: "new",
          price,
          link: `${productUrl}?color=${encodeURIComponent(color)}&size=${encodeURIComponent(size)}`,
          image_link: image,
          brand: "TeeDropper",
          google_product_category: sizeOverrides?.google_product_category ?? googleCategory,
          product_type: sizeOverrides?.product_type ?? productType,
          gender,
          age_group: sizeOverrides?.age_group ?? "adult",
          color,
          size,
          ...(p.material && { material: p.material }),
          ...(additionalImages[0] && { additional_image_link: additionalImages[0] }),
          item_group_id: docId,
          custom_label_0: niche,
          mpn: variants[size],
        });
      }
    }
  }

  return NextResponse.json(
    { version: "2.0", items },
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
