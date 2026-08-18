import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const db = getAdminDb();
  const doc = await db.collection("teedropper_products").doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // Return cached measurements if available — set at product upload time
  const cached = doc.data()?.measurements;
  if (cached) return NextResponse.json({ measurements: cached });

  // Fall back to live Printful call for products added before caching was introduced
  try {
    const printfulApiKey = process.env.PRINTFUL_API_KEY!;
    const variants = doc.data()?.variants as Record<string, string>;
    const firstVariantId = Object.values(variants)[0];

    const variantRes = await fetch(`https://api.printful.com/store/variants/${firstVariantId}`, {
      headers: { Authorization: `Bearer ${printfulApiKey}` },
    });
    const variantData = await variantRes.json();
    const productId = variantData.result?.product?.product_id;

    if (!productId) return NextResponse.json({ error: "Could not find base product" }, { status: 500 });

    const sizesRes = await fetch(`https://api.printful.com/products/${productId}/sizes`, {
      headers: { Authorization: `Bearer ${printfulApiKey}` },
    });
    const sizesData = await sizesRes.json();
    const tables = sizesData.result?.size_tables as { type: string; unit: string; measurements: unknown }[] | undefined;

    if (!tables?.length) return NextResponse.json({ error: "No size data" }, { status: 404 });

    const table = tables.find((t) => t.type === "measure_yourself" && t.unit === "inches") ?? tables[0];

    // Cache for next request
    await db.collection("teedropper_products").doc(id).update({ measurements: table.measurements });

    return NextResponse.json({ measurements: table.measurements });
  } catch (err) {
    console.error("Printful sizes fetch failed for", id, err);
    return NextResponse.json({ error: "Size chart temporarily unavailable" }, { status: 503 });
  }
}
