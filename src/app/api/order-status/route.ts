import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  try {
    const db = getAdminDb();

    // Look up all orders for this email, most recent first
    const snap = await db
      .collection("teedropper_webhook_events")
      .where("customerEmail", "==", email)
      .orderBy("processedAt", "desc")
      .limit(10)
      .get();

    if (snap.empty) {
      return NextResponse.json({ orders: [] });
    }

    const orders = snap.docs.map((doc) => {
      const d = doc.data();
      const processedAt: number = d.processedAt ?? 0;
      // Estimated delivery: 5–10 business days from order date
      const estimatedFrom = new Date(processedAt + 5 * 24 * 60 * 60 * 1000);
      const estimatedTo = new Date(processedAt + 10 * 24 * 60 * 60 * 1000);

      return {
        orderId: doc.id,
        processedAt,
        estimatedFrom: estimatedFrom.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        estimatedTo: estimatedTo.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: d.status ?? "processing",
        printfulOrderId: d.printfulOrderId ?? null,
        items: d.items ?? [],
      };
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Order status lookup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
