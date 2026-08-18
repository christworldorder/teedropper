import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase-admin";
import { randomUUID } from "crypto";

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
      // Log failed order so it can be manually fulfilled
      await eventRef.set({
        processedAt: Date.now(),
        printfulOrderId: null,
        printfulError: JSON.stringify(data),
        customerEmail: email,
        customerName,
        items: printfulItems.map((i) => ({ variantId: i.sync_variant_id, quantity: i.quantity })),
        status: "printful_failed",
      });
      return NextResponse.json({ error: "Printful order failed", details: data }, { status: 500 });
    }

    const printfulOrderId = data.result?.id;
    console.log("Printful order created:", printfulOrderId);

    // Explicitly confirm the order (confirm:true in body is unreliable)
    const confirmRes = await fetch(`https://api.printful.com/orders/${printfulOrderId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${printfulApiKey}`,
        "Content-Type": "application/json",
      },
    });
    if (!confirmRes.ok) {
      const confirmErr = await confirmRes.json();
      console.error("Printful order confirm failed:", confirmErr);
      // Order exists but isn't confirmed — log it so it can be manually confirmed
      await eventRef.set({
        processedAt: Date.now(),
        printfulOrderId,
        printfulError: `confirm_failed: ${JSON.stringify(confirmErr)}`,
        customerEmail: email,
        customerName,
        items: printfulItems.map((i) => ({ variantId: i.sync_variant_id, quantity: i.quantity })),
        status: "printful_confirm_failed",
      });
      return NextResponse.json({ error: "Printful order confirm failed", details: confirmErr }, { status: 500 });
    }
    console.log("Printful order confirmed:", printfulOrderId);

    // Generate review tokens — one per unique product, before email so links can be included
    const productIds = session.metadata?.product_id
      ? [...new Set(session.metadata.product_id.split(",").filter(Boolean))]
      : [];
    const reviewTokens: { productId: string; token: string }[] = [];
    if (productIds.length > 0) {
      const db2 = getAdminDb();
      await Promise.all(
        productIds.map(async (productId) => {
          const token = randomUUID();
          await db2.collection("review_tokens").doc(token).set({
            orderId: session.id,
            productId,
            used: false,
            createdAt: Date.now(),
          });
          reviewTokens.push({ productId, token });
        })
      );
    }

    // Send confirmation email to customer (no review link — shirt hasn't arrived yet)
    if (email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY!);
        const lineItemsData = (session.line_items as Stripe.ApiList<Stripe.LineItem> | undefined)?.data ?? [];
        const itemList = printfulItems
          .map((item, idx) => {
            const name = lineItemsData[idx]?.description || `Item ${idx + 1}`;
            return `<li style="margin-bottom:4px;">${name} × ${item.quantity}</li>`;
          })
          .join("");

        await resend.emails.send({
          from: "TeeDropper <support@nevermissed.app>",
          to: email,
          subject: "Your TeeDropper order is confirmed!",
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
              <h1 style="font-size:24px;font-weight:900;margin-bottom:4px;">Order Confirmed!</h1>
              <p style="color:#555;margin-top:0;">Hey ${customerName.split(" ")[0]}, thanks for your order. We're getting it printed now.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
              <h2 style="font-size:16px;font-weight:700;margin-bottom:8px;">What you ordered</h2>
              <ul style="padding-left:20px;color:#333;">${itemList}</ul>
              <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
              <p style="color:#555;font-size:14px;">Your gear typically arrives in <strong>5–10 days</strong>. You'll get a separate email with tracking once it's on its way.</p>
              <p style="color:#555;font-size:14px;">Questions? Hit us at <a href="https://www.teedropper.com/support" style="color:#000;">teedropper.com/support</a></p>
              <p style="font-size:12px;color:#aaa;margin-top:32px;">TeeDropper — teedropper.com</p>
            </div>
          `,
        });

        // Schedule the review request email for day 15 — after the shirt has arrived
        // Store the Resend email ID so it can be cancelled if the order is refunded/cancelled
        if (reviewTokens.length > 0) {
          const reviewLinks = reviewTokens
            .map(({ token }) =>
              `<a href="https://www.teedropper.com/review?token=${token}" style="display:inline-block;background:#facc15;color:#000;font-weight:900;padding:12px 24px;border-radius:20px;text-decoration:none;font-size:15px;margin:4px 0;">Leave a Review</a>`
            )
            .join("<br/>");

          const day15 = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();

          const reviewEmailResult = await resend.emails.send({
            from: "TeeDropper <support@nevermissed.app>",
            to: email,
            subject: "How's your TeeDropper gear?",
            scheduledAt: day15,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
                <h1 style="font-size:22px;font-weight:900;margin-bottom:4px;">Your gear should have arrived by now.</h1>
                <p style="color:#555;margin-top:0;">Hey ${customerName.split(" ")[0]} — if you've had a chance to wear it, we'd love to know what you think. Takes 2 minutes.</p>
                <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
                ${reviewLinks}
                <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
                <p style="color:#aaa;font-size:12px;">No pressure — but honest reviews help other fighters and believers find the right gear.</p>
                <p style="color:#aaa;font-size:12px;">Questions? <a href="https://www.teedropper.com/support" style="color:#555;">teedropper.com/support</a></p>
                <p style="font-size:12px;color:#aaa;margin-top:32px;">TeeDropper — teedropper.com</p>
              </div>
            `,
          });
          // Store the Resend email ID on the order document so it can be cancelled via
          // resend.emails.cancel(id) if the order is refunded or lost before day 15
          if (reviewEmailResult.data?.id) {
            await eventRef.update({ reviewEmailId: reviewEmailResult.data.id, reviewEmailScheduledFor: day15 });
          }
        }
      } catch (emailErr) {
        console.error("Confirmation email failed:", emailErr);
        // Don't fail the webhook over an email error
      }
    }

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
