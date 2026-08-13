import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

export async function POST(req: NextRequest) {
  const { password, product } = await req.json();

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, price, tag, image, variants, category } = product;

  if (!name || !price || !variants || Object.keys(variants).length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getAdminDb();

  const ref = await db.collection("teedropper_products").add({
    name,
    description: description || "",
    price: parseFloat(price),
    tag: tag || "New Drop",
    image: image || "",
    variants,
    ...(category ? { category } : {}),
    createdAt: Date.now(),
  });

  return NextResponse.json({ success: true, id: ref.id });
}
