import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const { id } = await params;
  const { action, password } = await req.json();

  if (typeof password !== "string" || password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const reviewRef = db.collection("reviews").doc(id);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const review = reviewDoc.data()!;

    if (review.status !== "pending") {
      return NextResponse.json({ error: "Review has already been moderated" }, { status: 409 });
    }

    if (action === "reject") {
      await reviewRef.update({ status: "rejected", moderatedAt: Date.now() });
      return NextResponse.json({ success: true, action: "rejected" });
    }

    // Approve: update product avgRating + reviewCount atomically
    const productRef = db.collection("teedropper_products").doc(review.productId);

    await db.runTransaction(async (tx) => {
      const productDoc = await tx.get(productRef);
      const currentCount = (productDoc.data()?.reviewCount ?? 0) as number;
      const currentAvg = (productDoc.data()?.avgRating ?? 0) as number;

      const newCount = currentCount + 1;
      const newAvg = parseFloat(
        (((currentAvg * currentCount) + review.rating) / newCount).toFixed(2)
      );

      tx.update(productRef, { reviewCount: newCount, avgRating: newAvg });
      tx.update(reviewRef, { status: "approved", moderatedAt: Date.now() });
    });

    return NextResponse.json({ success: true, action: "approved" });
  } catch (err) {
    console.error("Review moderation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
