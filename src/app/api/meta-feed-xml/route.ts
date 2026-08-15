import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const CATEGORY_MAP: Record<string, string> = {
  mens: "Apparel &amp; Accessories &gt; Clothing &gt; Shirts &amp; Tops",
  womens: "Apparel &amp; Accessories &gt; Clothing &gt; Shirts &amp; Tops",
  hoodies: "Apparel &amp; Accessories &gt; Clothing &gt; Outerwear",
  "rashguard-mens": "Apparel &amp; Accessories &gt; Clothing &gt; Activewear",
  "rashguard-womens": "Apparel &amp; Accessories &gt; Clothing &gt; Activewear",
  kids: "Apparel &amp; Accessories &gt; Clothing &gt; Baby &amp; Toddler Clothing",
  flags: "Home &amp; Garden &gt; Decor &gt; Flags &amp; Pennants",
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

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const db = getAdminDb();
  const snap = await db.collection("teedropper_products").get();

  const itemLines: string[] = [];

  for (const doc of snap.docs) {
    const p = doc.data();
    const productId = doc.id;
    const price = `${Number(p.price).toFixed(2)} USD`;
    const productUrl = `https://www.teedropper.com/product/${productId}`;
    const category = p.category || "mens";
    const googleCategory = CATEGORY_MAP[category] || "Apparel &amp; Accessories &gt; Clothing";
    const gender = GENDER_MAP[category] || "unisex";
    const ageGroup = category === "kids" ? "kids" : "adult";
    const variants: Record<string, string> = p.variants || {};
    const sizes = Object.keys(variants);

    if (sizes.length === 0) continue;

    for (const size of sizes) {
      const itemId = `${productId}_${size.replace(/\s+/g, "_")}`;
      const title = sizes.length === 1 || size === "One Size"
        ? esc(p.name)
        : `${esc(p.name)} - ${esc(size)}`;

      // For color variants (e.g. "Black-XL"), extract color and fall back to main product image
      const colorMatch = size.match(/^(.+)-([^-]+)$/);
      let imageUrl = colorMatch && p.colorImages?.[colorMatch[1]]
        ? p.colorImages[colorMatch[1]]
        : p.image || "";
      // Ensure image URL is absolute
      if (imageUrl && imageUrl.startsWith("/")) {
        imageUrl = `https://www.teedropper.com${imageUrl}`;
      }
      const displaySize = colorMatch ? colorMatch[2] : size;

      itemLines.push(`    <item>
      <g:id>${esc(itemId)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${esc(p.description || p.name)}</g:description>
      <g:link>${esc(productUrl)}</g:link>
      <g:image_link>${esc(imageUrl)}</g:image_link>
      <g:availability>in stock</g:availability>
      <g:quantity_to_sell_on_facebook>999</g:quantity_to_sell_on_facebook>
      <g:condition>new</g:condition>
      <g:price>${price}</g:price>
      <g:brand>TeeDropper</g:brand>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:item_group_id>${esc(productId)}</g:item_group_id>
      <g:size>${esc(displaySize)}</g:size>
      <g:gender>${gender}</g:gender>
      <g:age_group>${ageGroup}</g:age_group>
    </item>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>TeeDropper Products</title>
    <link>https://www.teedropper.com</link>
    <description>TeeDropper product catalog</description>
${itemLines.join("\n")}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
