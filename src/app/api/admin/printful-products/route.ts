import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const printfulApiKey = process.env.PRINTFUL_API_KEY!;

  // Fetch sync products list
  const res = await fetch("https://api.printful.com/store/products?limit=100", {
    headers: { Authorization: `Bearer ${printfulApiKey}` },
  });
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: "Printful error", details: data }, { status: 500 });
  }

  // For each product, fetch its sync variants
  const products = data.result as { id: number; name: string; thumbnail_url: string }[];

  const detailed = await Promise.all(
    products.map(async (p) => {
      const vRes = await fetch(`https://api.printful.com/store/products/${p.id}`, {
        headers: { Authorization: `Bearer ${printfulApiKey}` },
      });
      const vData = await vRes.json();
      const variants = (vData.result?.sync_variants || []) as {
        id: number;
        name: string;
        retail_price: string;
        color: string;
        size: string;
      }[];
      return {
        id: p.id,
        name: p.name,
        thumbnail: p.thumbnail_url,
        variants: variants.map((v) => ({
          id: v.id,
          name: v.name,
          price: v.retail_price,
          color: v.color,
          size: v.size,
        })),
      };
    })
  );

  return NextResponse.json({ products: detailed });
}
