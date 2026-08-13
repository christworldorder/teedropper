import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import { Product } from "@/lib/products";

export const dynamic = "force-dynamic";

type MultiItem = {
  productId: string;
  color?: string;
  size: string;
  quantity?: number;
};

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.json();
  const origin = req.headers.get("origin") || "https://teedropper.com";
  const db = getAdminDb();

  // --- Multi-item path ---
  if (Array.isArray(body.items) && body.items.length > 0) {
    const incomingItems: MultiItem[] = body.items;

    // Load all unique products from Firestore
    const productIds = [...new Set(incomingItems.map((i) => i.productId))];
    const productMap = new Map<string, Product>();
    await Promise.all(
      productIds.map(async (pid) => {
        const snap = await db.collection("teedropper_products").doc(pid).get();
        if (snap.exists) productMap.set(pid, { id: snap.id, ...snap.data() } as Product);
      })
    );

    // Build Stripe line items and collect variant IDs
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const printfulVariants: { variantId: string; quantity: number }[] = [];

    for (const incoming of incomingItems) {
      const product = productMap.get(incoming.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${incoming.productId}` }, { status: 404 });
      }

      const variantKey = incoming.color ? `${incoming.color}-${incoming.size}` : incoming.size;
      const variantId = product.variants?.[variantKey];
      if (!variantId) {
        return NextResponse.json({ error: `Variant not available: ${variantKey}` }, { status: 400 });
      }

      const image = (incoming.color && product.colorImages?.[incoming.color]) || product.image || "";
      const label = incoming.color
        ? `${product.name} — ${incoming.color} / ${incoming.size}`
        : `${product.name} — ${incoming.size}`;

      const qty = incoming.quantity && incoming.quantity > 0 ? incoming.quantity : 1;

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: label,
            images: image ? [image] : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: qty,
      });

      printfulVariants.push({ variantId, quantity: qty });
    }

    // Use the first product ID for the cancel URL fallback
    const cancelProductId = incomingItems[0]?.productId;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "NL", "SE", "NO", "DK"],
      },
      metadata: {
        printful_variant_ids: JSON.stringify(printfulVariants),
        product_id: incomingItems.map((i) => i.productId).join(","),
      },
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.json({ url: session.url });
  }

  // --- Single-item legacy path ---
  const { productId, color, size } = body;

  if (!productId || !size) {
    return NextResponse.json({ error: "Missing productId or size" }, { status: 400 });
  }

  const docSnap = await db.collection("teedropper_products").doc(productId).get();
  if (!docSnap.exists) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const product = { id: docSnap.id, ...docSnap.data() } as Product;

  // Support color-size keys ("Black-XS") or legacy size-only keys ("XS")
  const variantKey = color ? `${color}-${size}` : size;
  const variantId = product.variants?.[variantKey];

  if (!variantId) {
    return NextResponse.json({ error: "Variant not available" }, { status: 400 });
  }

  // Use color-specific image if available
  const image = (color && product.colorImages?.[color]) || product.image || "";
  const label = color ? `${product.name} — ${color} / ${size}` : `${product.name} — ${size}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: label,
            images: image ? [image] : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      },
    ],
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "NL", "SE", "NO", "DK"],
    },
    metadata: {
      printful_variant_id: variantId,
      product_id: productId,
      color: color || "",
      size,
    },
    success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop/${productId}`,
  });

  return NextResponse.json({ url: session.url });
}
