import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { Resend } from "resend";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// POST — customer requests a magic link
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const normalized = (email ?? "").trim().toLowerCase();

  if (!normalized || !normalized.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  try {
    const db = getAdminDb();

    // Check if this email has any orders at all before sending
    const snap = await db
      .collection("teedropper_webhook_events")
      .where("customerEmail", "==", normalized)
      .limit(1)
      .get();

    // Always respond "sent" regardless of whether we found orders —
    // prevents email enumeration (attacker can't tell who is a customer)
    if (!snap.empty) {
      const token = randomUUID();
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

      await db.collection("order_lookup_tokens").doc(token).set({
        email: normalized,
        expiresAt,
        createdAt: Date.now(),
      });

      const resend = new Resend(process.env.RESEND_API_KEY!);
      await resend.emails.send({
        from: "TeeDropper <support@nevermissed.app>",
        to: normalized,
        subject: "Your TeeDropper order status link",
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
            <h1 style="font-size:20px;font-weight:900;margin-bottom:4px;">Order Status</h1>
            <p style="color:#555;margin-top:0;font-size:14px;">Click the link below to view your order status. It expires in 1 hour.</p>
            <a href="https://www.teedropper.com/order-status?token=${token}"
               style="display:inline-block;background:#facc15;color:#000;font-weight:900;padding:12px 24px;border-radius:20px;text-decoration:none;font-size:15px;margin:16px 0;">
              View My Orders
            </a>
            <p style="color:#aaa;font-size:12px;margin-top:16px;">
              Didn't request this? Ignore it — no action needed.<br/>
              Questions? <a href="https://www.teedropper.com/support" style="color:#555;">teedropper.com/support</a>
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Order status magic link error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET — validate token and return orders
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const tokenDoc = await db.collection("order_lookup_tokens").doc(token).get();

    if (!tokenDoc.exists) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
    }

    const tokenData = tokenDoc.data()!;
    if (tokenData.expiresAt < Date.now()) {
      return NextResponse.json({ error: "This link has expired. Request a new one." }, { status: 410 });
    }

    const email: string = tokenData.email;

    const snap = await db
      .collection("teedropper_webhook_events")
      .where("customerEmail", "==", email)
      .orderBy("processedAt", "desc")
      .limit(10)
      .get();

    const orders = snap.docs.map((doc) => {
      const d = doc.data();
      const processedAt: number = d.processedAt ?? 0;
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

    return NextResponse.json({ orders, email });
  } catch (err) {
    console.error("Order status token validation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
