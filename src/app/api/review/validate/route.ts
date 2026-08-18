import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const tokenDoc = await db.collection("review_tokens").doc(token).get();

    if (!tokenDoc.exists) {
      return NextResponse.json({ error: "Invalid or expired review link" }, { status: 404 });
    }

    const tokenData = tokenDoc.data()!;

    if (tokenData.used) {
      return NextResponse.json({ error: "This review link has already been used" }, { status: 409 });
    }

    // Fetch product name for the form
    const productDoc = await db.collection("teedropper_products").doc(tokenData.productId).get();
    const productName = productDoc.exists ? (productDoc.data()?.name ?? "this product") : "this product";

    return NextResponse.json({
      valid: true,
      productId: tokenData.productId,
      productName,
      orderId: tokenData.orderId,
    });
  } catch (err) {
    console.error("Review token validation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
