import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getAdminDb();
  const snap = await db.collection("teedropper_products").orderBy("createdAt", "desc").get();
  const products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(products);
}
