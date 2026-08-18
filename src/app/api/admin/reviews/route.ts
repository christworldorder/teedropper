import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password");

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getAdminDb();

    // Get all pending reviews, sorted by oldest first so oldest waits get priority
    const snap = await db
      .collection("reviews")
      .where("status", "==", "pending")
      .orderBy("createdAt", "asc")
      .get();

    const reviews = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Record<string, unknown> & { id: string; productId: string }));

    // Fetch product names for display
    const productIds = [...new Set(reviews.map((r) => r.productId))];
    const productMap: Record<string, string> = {};
    await Promise.all(
      productIds.map(async (pid) => {
        const pDoc = await db.collection("teedropper_products").doc(pid).get();
        if (pDoc.exists) productMap[pid] = pDoc.data()?.name ?? pid;
      })
    );

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        ...r,
        productName: productMap[r.productId] ?? r.productId,
      })),
    });
  } catch (err) {
    console.error("Admin reviews fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
