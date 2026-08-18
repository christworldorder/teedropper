import type { Metadata } from "next";
import ShopPageClient from "./ShopPageClient";

export const metadata: Metadata = {
  title: "All Drops — TeeDropper",
  description: "Browse every tee in the TeeDropper collection. Fight, Faith & Fitness apparel shipped from the US in 5–10 days.",
  alternates: { canonical: "https://www.teedropper.com/shop" },
  openGraph: {
    title: "All Drops — TeeDropper",
    description: "Browse every tee in the TeeDropper collection. Fight, Faith & Fitness apparel shipped from the US in 5–10 days.",
    url: "https://www.teedropper.com/shop",
  },
};

export default function ShopPage() {
  return <ShopPageClient />;
}
