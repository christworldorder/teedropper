import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATEGORY_MAP: Record<string, string> = {
  mens:             "Apparel & Accessories > Clothing > Shirts & Tops",
  womens:           "Apparel & Accessories > Clothing > Shirts & Tops",
  hoodies:          "Apparel & Accessories > Clothing > Outerwear",
  "rashguard-mens": "Apparel & Accessories > Clothing > Activewear",
  "rashguard-womens":"Apparel & Accessories > Clothing > Activewear",
  kids:             "Apparel & Accessories > Clothing > Baby & Toddler Clothing",
  flags:            "Home & Garden > Decor > Flags & Windsocks",
};

const GENDER_MAP: Record<string, string> = {
  mens:             "male",
  womens:           "female",
  hoodies:          "unisex",
  "rashguard-mens": "male",
  "rashguard-womens":"female",
  kids:             "unisex",
  flags:            "unisex",
};

const AGE_MAP: Record<string, string> = {
  kids: "kids",
};

function slug(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
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
    const gender = GENDER_MAP[category] || "unisex";
    const ageGroup = AGE_MAP[category] || "adult";
    const isFlag = category === "flags";

    const variants: Record<string, string> = p.variants || {};
    const variantKeys = Object.keys(variants);
    if (variantKeys.length === 0) continue;

    // Detect whether variants use Color-Size format (e.g. "Black-XL")
    const hasColorInKey = variantKeys.some((k) => k.includes("-"));

    if (isFlag) {
      // Flags: one row, no size/gender/age_group
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
        ...(p.color && { color: p.color }),
        ...(p.material && { material: p.material }),
        item_group_id: docId,
        custom_label_0: variantKeys[0] ? variants[variantKeys[0]] : "",
      });
      continue;
    }

    if (hasColorInKey) {
      // Variants already keyed as Color-Size — iterate directly
      for (const key of variantKeys) {
        const dashIdx = key.indexOf("-");
        const color = key.slice(0, dashIdx);
        const size = key.slice(dashIdx + 1);
        const image =
          (p.colorImages && p.colorImages[color]) || p.image || "";

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
          google_product_category: googleCategory,
          gender,
          age_group: ageGroup,
          color,
          size,
          ...(p.material && { material: p.material }),
          item_group_id: docId,
          custom_label_0: variants[key],
        });
      }
    } else {
      // Variants keyed as Size only — use stored color field, one row per size
      const color: string = p.color || "Black";
      const image =
        (p.colorImages && p.colorImages[color]) || p.image || "";

      for (const size of variantKeys) {
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
          google_product_category: googleCategory,
          gender,
          age_group: ageGroup,
          color,
          size,
          ...(p.material && { material: p.material }),
          item_group_id: docId,
          custom_label_0: variants[size],
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
