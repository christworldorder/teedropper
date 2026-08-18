import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const { password, product } = await req.json();

  if (typeof password !== "string" || password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, price, tag, image, variants, category, color, material, additionalImages } = product;

  if (!name || !price || !variants || Object.keys(variants).length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!description || description.length < 300) {
    return NextResponse.json({ error: `Description must be at least 300 characters (got ${description?.length ?? 0})` }, { status: 400 });
  }

  const BASE_URL = "https://www.teedropper.com";
  const toAbsolute = (url: string) =>
    url && url.startsWith("/") ? BASE_URL + url : url;

  const db = getAdminDb();

  const ref = await db.collection("teedropper_products").add({
    name,
    description,
    price: parseFloat(price),
    tag: tag || "New Drop",
    image: toAbsolute(image || ""),
    variants,
    ...(category ? { category } : {}),
    ...(color ? { color } : {}),
    ...(material ? { material } : {}),
    ...(additionalImages?.length ? { additionalImages: additionalImages.map(toAbsolute) } : {}),
    createdAt: Date.now(),
  });

  // Cache Printful size measurements on the product doc so the size chart
  // never needs a live API call at customer request time.
  try {
    const printfulApiKey = process.env.PRINTFUL_API_KEY!;
    const firstVariantId = Object.values(variants)[0] as string;
    const variantRes = await fetch(`https://api.printful.com/store/variants/${firstVariantId}`, {
      headers: { Authorization: `Bearer ${printfulApiKey}` },
    });
    const variantData = await variantRes.json();
    const printfulProductId = variantData.result?.product?.product_id;
    if (printfulProductId) {
      const sizesRes = await fetch(`https://api.printful.com/products/${printfulProductId}/sizes`, {
        headers: { Authorization: `Bearer ${printfulApiKey}` },
      });
      const sizesData = await sizesRes.json();
      const tables = sizesData.result?.size_tables as { type: string; unit: string; measurements: unknown }[] | undefined;
      if (tables?.length) {
        const table = tables.find((t) => t.type === "measure_yourself" && t.unit === "inches") ?? tables[0];
        await ref.update({ measurements: table.measurements });
      }
    }
  } catch (err) {
    // Non-fatal: sizes endpoint falls back to live Printful call
    console.error("Failed to cache measurements for", ref.id, err);
  }

  return NextResponse.json({ success: true, id: ref.id });
}
