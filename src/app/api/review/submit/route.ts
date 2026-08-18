import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, rating, title, reviewBody, fit, photoUrl, authorName, incentivized } = body;

  if (!token || !rating || !title || !reviewBody || !authorName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }

  if (reviewBody.trim().length < 20) {
    return NextResponse.json({ error: "Review must be at least 20 characters" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const tokenRef = db.collection("review_tokens").doc(token);
    const tokenDoc = await tokenRef.get();

    if (!tokenDoc.exists) {
      return NextResponse.json({ error: "Invalid or expired review link" }, { status: 404 });
    }

    const tokenData = tokenDoc.data()!;

    if (tokenData.used) {
      return NextResponse.json({ error: "This review link has already been used" }, { status: 409 });
    }

    // Create the review
    await db.collection("reviews").add({
      productId: tokenData.productId,
      orderId: tokenData.orderId,
      rating,
      title: title.trim(),
      body: reviewBody.trim(),
      fit: fit || null,
      photoUrl: photoUrl || null,
      authorName: authorName.trim(),
      verifiedPurchase: true,
      incentivized,
      status: "pending",
      createdAt: Date.now(),
    });

    // Mark token used
    await tokenRef.update({ used: true, usedAt: Date.now() });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Review submit error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
