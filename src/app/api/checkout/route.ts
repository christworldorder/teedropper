import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/products";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const { productId, size } = await req.json();

  if (!productId || !size) {
    return NextResponse.json({ error: "Missing productId or size" }, { status: 400 });
  }

  const snap = await getDoc(doc(db, "teedropper_products", productId));
  if (!snap.exists()) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const product = { id: snap.id, ...snap.data() } as Product;
  const variantId = product.variants?.[size];

  if (!variantId) {
    return NextResponse.json({ error: "Size not available" }, { status: 400 });
  }

  const origin = req.headers.get("origin") || "https://teedropper.com";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${product.name} — ${size}`,
            images: product.image ? [product.image] : [],
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
      size,
    },
    success_url: `${origin}/thank-you`,
    cancel_url: `${origin}/shop/${productId}`,
  });

  return NextResponse.json({ url: session.url });
}
