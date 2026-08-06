import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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

  const session = event.data.object as Stripe.Checkout.Session & {
    shipping_details?: { name?: string; address?: { line1?: string; line2?: string; city?: string; state?: string; country?: string; postal_code?: string } };
  };

  // Extract customer info
  const customerName = session.shipping_details?.name || session.customer_details?.name || "Customer";
  const shipping = session.shipping_details?.address;
  const email = session.customer_details?.email || "";

  if (!shipping) {
    console.error("No shipping address on session:", session.id);
    return NextResponse.json({ error: "No shipping address" }, { status: 400 });
  }

  // Get product info from session metadata or line items
  const lineItemsRes = await stripe.checkout.sessions.listLineItems(session.id);
  const items = lineItemsRes.data;

  if (!items.length) {
    return NextResponse.json({ error: "No items in session" }, { status: 400 });
  }

  // Build Printful order
  const printfulItems = items.map((item) => ({
    sync_variant_id: item.price?.metadata?.printful_variant_id,
    quantity: item.quantity || 1,
    retail_price: ((item.amount_total || 0) / 100).toFixed(2),
  })).filter((i) => i.sync_variant_id);

  if (!printfulItems.length) {
    console.error("No Printful variant IDs found on Stripe line items. Add printful_variant_id to Price metadata.");
    return NextResponse.json({ error: "No Printful variant IDs" }, { status: 400 });
  }

  const printfulOrder = {
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

    console.log("Printful order created:", data.result?.id);
    return NextResponse.json({ success: true, printful_order_id: data.result?.id });
  } catch (err) {
    console.error("Printful API error:", err);
    return NextResponse.json({ error: "Printful API error" }, { status: 500 });
  }
}
