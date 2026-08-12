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

  // --- Resolve Printful items ---
  // Multi-item path: metadata has printful_variant_ids as JSON array
  const rawVariantIds = session.metadata?.printful_variant_ids;
  const singleVariantId = session.metadata?.printful_variant_id;

  type PrintfulVariantEntry = { variantId: string; quantity: number };

  let printfulItems: { sync_variant_id: string; quantity: number; retail_price: string }[] = [];

  if (rawVariantIds) {
    // Multi-item cart checkout
    let variantEntries: PrintfulVariantEntry[] = [];
    try {
      variantEntries = JSON.parse(rawVariantIds) as PrintfulVariantEntry[];
    } catch (e) {
      console.error("Failed to parse printful_variant_ids:", e);
      return NextResponse.json({ error: "Invalid printful_variant_ids metadata" }, { status: 400 });
    }

    const lineItemsData = (session.line_items as Stripe.ApiList<Stripe.LineItem> | undefined)?.data ?? [];

    printfulItems = variantEntries.map((entry, idx) => {
      const lineItem = lineItemsData[idx];
      // Per-unit retail price: total / quantity
      const unitPrice = lineItem
        ? ((lineItem.amount_total || 0) / 100 / (lineItem.quantity || 1)).toFixed(2)
        : "0.00";
      return {
        sync_variant_id: entry.variantId,
        quantity: entry.quantity,
        retail_price: unitPrice,
      };
    });
  } else if (singleVariantId) {
    // Legacy single-item path
    const lineItemsData = (session.line_items as Stripe.ApiList<Stripe.LineItem> | undefined)?.data ?? [];
    const firstItem = lineItemsData[0];
    const retailPrice = ((firstItem?.amount_total || 0) / 100).toFixed(2);
    const quantity = firstItem?.quantity || 1;
    printfulItems = [{ sync_variant_id: singleVariantId, quantity, retail_price: retailPrice }];
  } else {
    console.error("No Printful variant ID(s) in session metadata:", session.id);
    return NextResponse.json({ error: "No Printful variant ID" }, { status: 400 });
  }

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
    items: printfulItems,
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
      items: printfulItems.map((i) => ({ variantId: i.sync_variant_id, quantity: i.quantity })),
      // Keep legacy fields for single-item orders
      ...(singleVariantId && !rawVariantIds
        ? { variantId: singleVariantId, size: session.metadata?.size || "" }
        : {}),
    });

    return NextResponse.json({ success: true, printful_order_id: printfulOrderId });
  } catch (err) {
    console.error("Printful API error:", err);
    return NextResponse.json({ error: "Printful API error" }, { status: 500 });
  }
}
