import { getAdminDb } from "@/lib/firebase-admin";

const BASE = "https://www.teedropper.com";

const STATIC_PAGES = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/category/mens", priority: "0.9", changefreq: "daily" },
  { url: "/category/womens", priority: "0.9", changefreq: "daily" },
  { url: "/category/rashguard-mens", priority: "0.9", changefreq: "daily" },
  { url: "/category/rashguard-womens", priority: "0.9", changefreq: "daily" },
  { url: "/category/hoodies", priority: "0.9", changefreq: "daily" },
  { url: "/category/kids", priority: "0.9", changefreq: "daily" },
  { url: "/category/flags", priority: "0.9", changefreq: "daily" },
  { url: "/privacy-policy", priority: "0.3", changefreq: "monthly" },
  { url: "/terms", priority: "0.3", changefreq: "monthly" },
  { url: "/returns", priority: "0.3", changefreq: "monthly" },
];

export async function GET() {
  let productUrls: { url: string; priority: string; changefreq: string }[] = [];

  try {
    const db = getAdminDb();
    const snap = await db.collection("teedropper_products").get();
    productUrls = snap.docs.map((doc) => ({
      url: `/product/${doc.id}`,
      priority: "0.8",
      changefreq: "weekly",
    }));
  } catch {}

  const allPages = [...STATIC_PAGES, ...productUrls];
  const now = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    ({ url, priority, changefreq }) => `  <url>
    <loc>${BASE}${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
