import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import { Product } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { productId, color, size } = await req.json();

  if (!productId || !size) {
    return NextResponse.json({ error: "Missing productId or size" }, { status: 400 });
  }

  const db = getAdminDb();
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

  const origin = req.headers.get("origin") || "https://teedropper.com";

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
    success_url: `${origin}/thank-you`,
    cancel_url: `${origin}/shop/${productId}`,
  });

  return NextResponse.json({ url: session.url });
}
