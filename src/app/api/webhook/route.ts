import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const printfulApiKey = process.env.PRINTFUL_API_KEY!;
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const rawSession = event.data.object as Stripe.Checkout.Session & {
    shipping_details?: { name?: string; address?: { line1?: string; line2?: string; city?: string; state?: string; country?: string; postal_code?: string } };
    collected_information?: { shipping_details?: { address?: { line1?: string; line2?: string; city?: string; state?: string; country?: string; postal_code?: string } } };
  };

  // Re-fetch session to get expanded line_items; use rawSession for shipping (already in payload)
  const fullSession = await stripe.checkout.sessions.retrieve(rawSession.id, {
    expand: ["line_items"],
  });

  const session = { ...rawSession, line_items: fullSession.line_items };

  // Idempotency: skip if already processed
  const db = getAdminDb();
  const eventRef = db.collection("teedropper_webhook_events").doc(session.id);
  const existing = await eventRef.get();
  if (existing.exists) {
    console.log("Webhook already processed for session:", session.id);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Extract customer info — shipping may be under collected_information (newer Stripe API) or shipping_details (older)
  const customerName = session.shipping_details?.name || session.customer_details?.name || "Customer";
  const shipping = session.collected_information?.shipping_details?.address || session.shipping_details?.address || session.customer_details?.address;
  const email = session.customer_details?.email || "";

  if (!shipping) {
    console.error("No shipping address on session:", session.id);
    return NextResponse.json({ received: true, skipped: "no shipping address" });
  }

  // Get variant ID from session metadata (set by /api/checkout)
  const variantId = session.metadata?.printful_variant_id;
  const size = session.metadata?.size || "";

  if (!variantId) {
    console.error("No printful_variant_id in session metadata:", session.id);
    return NextResponse.json({ error: "No Printful variant ID" }, { status: 400 });
  }

  // Get amount from expanded line items
  const firstItem = (session.line_items as Stripe.ApiList<Stripe.LineItem> | undefined)?.data?.[0];
  const retailPrice = ((firstItem?.amount_total || 0) / 100).toFixed(2);
  const quantity = firstItem?.quantity || 1;

  const printfulOrder = {
    confirm: true, // Auto-confirm so order ships immediately
    recipient: {
      name: customerName,
      email,
      address1: shipping.line1 || "",
      address2: shipping.line2 || "",
      city: shipping.city || "",
      state_code: shipping.state || "",
      country_code: shipping.country || "US",
      zip: shipping.postal_code || "",
    },
    items: [
      {
        sync_variant_id: variantId,
        quantity,
        retail_price: retailPrice,
      },
    ],
  };

  try {
    const res = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${printfulApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(printfulOrder),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Printful order failed:", data);
      return NextResponse.json({ error: "Printful order failed", details: data }, { status: 500 });
    }

    const printfulOrderId = data.result?.id;
    console.log("Printful order created and confirmed:", printfulOrderId);

    // Log order to Firestore
    await eventRef.set({
      processedAt: Date.now(),
      printfulOrderId,
      customerEmail: email,
      customerName,
      size,
      variantId,
    });

    return NextResponse.json({ success: true, printful_order_id: printfulOrderId });
  } catch (err) {
    console.error("Printful API error:", err);
    return NextResponse.json({ error: "Printful API error" }, { status: 500 });
  }
}
