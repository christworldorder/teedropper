import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;

  try {
    const db = getAdminDb();
    const snap = await db
      .collection("reviews")
      .where("productId", "==", productId)
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc")
      .get();

    const reviews = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("Reviews fetch error:", err);
    return NextResponse.json({ reviews: [] });
  }
}
