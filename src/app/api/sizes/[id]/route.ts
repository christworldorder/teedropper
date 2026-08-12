import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const printfulApiKey = process.env.PRINTFUL_API_KEY!;

  // Get product from Firestore to find a variant ID
  const db = getAdminDb();
  const doc = await db.collection("teedropper_products").doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const variants = doc.data()?.variants as Record<string, string>;
  const firstVariantId = Object.values(variants)[0];

  // Get the Printful base product ID from the sync variant
  const variantRes = await fetch(`https://api.printful.com/store/variants/${firstVariantId}`, {
    headers: { Authorization: `Bearer ${printfulApiKey}` },
  });
  const variantData = await variantRes.json();
  const productId = variantData.result?.variant?.product?.product_id;

  if (!productId) return NextResponse.json({ error: "Could not find base product" }, { status: 500 });

  // Fetch size table from Printful catalog
  const sizesRes = await fetch(`https://api.printful.com/products/${productId}/sizes`, {
    headers: { Authorization: `Bearer ${printfulApiKey}` },
  });
  const sizesData = await sizesRes.json();
  const tables = sizesData.result?.size_tables;

  if (!tables || tables.length === 0) return NextResponse.json({ error: "No size data" }, { status: 404 });

  // Return the "measure_yourself" table in inches
  const table = tables.find((t: { type: string; unit: string }) => t.type === "measure_yourself" && t.unit === "inches") || tables[0];

  return NextResponse.json({ measurements: table.measurements });
}
