import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
  const { password, product } = await req.json();

  if (password !== ADMIN_PASSWORD) {
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

  return NextResponse.json({ success: true, id: ref.id });
}
