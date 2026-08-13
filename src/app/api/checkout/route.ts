import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import { Product } from "@/lib/products";

export const dynamic = "force-dynamic";

const ALLOWED_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = [
  "US", "CA", "GB", "AU", "DE", "FR", "NL", "SE", "NO", "DK",
];

const FLAT_SHIPPING_CENTS = 799;   // $7.99
const FREE_SHIPPING_THRESHOLD = 10000; // $100.00 in cents

function shippingOption(amountCents: number): Stripe.Checkout.SessionCreateParams.ShippingOption {
  return {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: amountCents, currency: "usd" },
      display_name: amountCents === 0 ? "Free Shipping" : "Standard Shipping",
      delivery_estimate: {
        minimum: { unit: "business_day", value: 3 },
        maximum: { unit: "business_day", value: 7 },
      },
    },
  };
}

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

  // --- Multi-item path (cart checkout) ---
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

    // Build Stripe line items and collect Printful variant IDs
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const printfulVariants: { variantId: string; quantity: number }[] = [];
    let totalQty = 0;

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
      totalQty += qty;

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: label, images: image ? [image] : [] },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: qty,
      });

      printfulVariants.push({ variantId, quantity: qty });
    }

    // Apply 10% bundle discount when 2+ total items
    const bundleDiscount = totalQty >= 2;
    if (bundleDiscount) {
      for (const item of lineItems) {
        item.price_data!.unit_amount = Math.round(item.price_data!.unit_amount! * 0.9);
      }
    }

    // Calculate subtotal (after discount) to determine shipping
    const subtotalCents = lineItems.reduce(
      (sum, item) => sum + item.price_data!.unit_amount! * (item.quantity as number),
      0
    );
    const shippingCents = subtotalCents >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_CENTS;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ALLOWED_COUNTRIES },
      shipping_options: [shippingOption(shippingCents)],
      ...(bundleDiscount
        ? { custom_text: { submit: { message: "10% bundle discount applied — add more, save more!" } } }
        : {}),
      metadata: {
        printful_variant_ids: JSON.stringify(printfulVariants),
        product_id: incomingItems.map((i) => i.productId).join(","),
      },
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.json({ url: session.url });
  }

  // --- Single-item path (Buy Now) ---
  const { productId, color, size } = body;

  if (!productId || !size) {
    return NextResponse.json({ error: "Missing productId or size" }, { status: 400 });
  }

  const docSnap = await db.collection("teedropper_products").doc(productId).get();
  if (!docSnap.exists) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const product = { id: docSnap.id, ...docSnap.data() } as Product;

  const variantKey = color ? `${color}-${size}` : size;
  const variantId = product.variants?.[variantKey];
  if (!variantId) {
    return NextResponse.json({ error: "Variant not available" }, { status: 400 });
  }

  const image = (color && product.colorImages?.[color]) || product.image || "";
  const label = color ? `${product.name} — ${color} / ${size}` : `${product.name} — ${size}`;
  const unitAmountCents = Math.round(product.price * 100);
  const shippingCents = unitAmountCents >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_CENTS;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: label, images: image ? [image] : [] },
          unit_amount: unitAmountCents,
        },
        quantity: 1,
      },
    ],
    shipping_address_collection: { allowed_countries: ALLOWED_COUNTRIES },
    shipping_options: [shippingOption(shippingCents)],
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
