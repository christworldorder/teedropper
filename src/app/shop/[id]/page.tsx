import { Metadata } from "next";
import { getAdminDb } from "@/lib/firebase-admin";
import { Product } from "@/lib/products";
import ProductPageClient from "./ProductPageClient";

async function getProduct(id: string): Promise<Product | null> {
  try {
    const db = getAdminDb();
    const doc = await db.collection("teedropper_products").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Product;
  } catch {
    return null;
  }
}

type SizeMeasurement = {
  type_label: string;
  values: { size: string; value?: string; min_value?: string; max_value?: string }[];
};

async function getMeasurements(id: string, variants: Record<string, string>): Promise<SizeMeasurement[] | null> {
  try {
    const printfulApiKey = process.env.PRINTFUL_API_KEY!;
    const firstVariantId = Object.values(variants)[0];

    const variantRes = await fetch(`https://api.printful.com/store/variants/${firstVariantId}`, {
      headers: { Authorization: `Bearer ${printfulApiKey}` },
      next: { revalidate: 86400 },
    });
    const variantData = await variantRes.json();
    const productId = variantData.result?.product?.product_id;
    if (!productId) return null;

    const sizesRes = await fetch(`https://api.printful.com/products/${productId}/sizes`, {
      headers: { Authorization: `Bearer ${printfulApiKey}` },
      next: { revalidate: 86400 },
    });
    const sizesData = await sizesRes.json();
    const tables = sizesData.result?.size_tables;
    if (!tables || tables.length === 0) return null;

    const table =
      tables.find((t: { type: string; unit: string }) => t.type === "measure_yourself" && t.unit === "inches") ||
      tables[0];

    return table.measurements as SizeMeasurement[];
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Product Not Found — TeeDropper" };
  }

  const title = `${product.name} — TeeDropper`;
  const description = product.description || `${product.name} — Viral tee from TeeDropper. Ships in 3-7 days.`;
  const image = product.image || "https://teedropper.com/og-default.jpg";
  const url = `https://teedropper.com/shop/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "TeeDropper",
      images: [{ url: image, width: 800, height: 800, alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  const measurements =
    product && product.variants && product.category !== "flags"
      ? await getMeasurements(id, product.variants)
      : null;

  // Pull the two most useful measurements for the page: chest and body length
  const chestRow = measurements?.find((m) =>
    m.type_label.toLowerCase().includes("chest") || m.type_label.toLowerCase().includes("width")
  );
  const lengthRow = measurements?.find((m) => m.type_label.toLowerCase().includes("length"));

  const sizes = chestRow?.values.map((v) => v.size) ?? [];

  const schema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || `${product.name} — TeeDropper`,
        image: product.image,
        sku: id,
        brand: { "@type": "Brand", name: "TeeDropper" },
        ...(sizes.length > 0 && { size: sizes }),
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `https://www.teedropper.com/shop/${id}`,
          seller: { "@type": "Organization", name: "TeeDropper" },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
            shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
              transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" },
            },
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "US",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 14,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
          },
        },
      }
    : null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      {/* Server-rendered size measurements for crawlers and conversion */}
      {(chestRow || lengthRow) && (
        <div className="max-w-5xl mx-auto px-4 pt-4 pb-0">
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
            <p className="font-black uppercase tracking-wide text-xs text-gray-500 mb-2">Size Guide (inches)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1 pr-4 font-bold">Size</th>
                    {chestRow && <th className="text-left py-1 pr-4 font-bold">{chestRow.type_label}</th>}
                    {lengthRow && <th className="text-left py-1 font-bold">{lengthRow.type_label}</th>}
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => {
                    const chest = chestRow?.values.find((v) => v.size === size);
                    const length = lengthRow?.values.find((v) => v.size === size);
                    const fmt = (v: typeof chest) =>
                      v ? v.value || (v.min_value && v.max_value ? `${v.min_value}-${v.max_value}` : v.min_value || "") : "";
                    return (
                      <tr key={size} className="border-b border-gray-100">
                        <td className="py-1 pr-4 font-bold">{size}</td>
                        {chestRow && <td className="py-1 pr-4">{fmt(chest)}</td>}
                        {lengthRow && <td className="py-1">{fmt(length)}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">True to size. Size up for an oversized fit. Measurements may vary ±1 inch.</p>
          </div>
        </div>
      )}
      <ProductPageClient id={id} />
    </>
  );
}
