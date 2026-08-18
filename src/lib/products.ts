export type ProductCategory = "mens" | "womens" | "rashguard-mens" | "rashguard-womens" | "hoodies" | "kids" | "flags";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tag: string;
  category?: ProductCategory;
  variants: Record<string, string>; // "Black-XS": "id" OR legacy "XS": "id"
  colorImages?: Record<string, string>; // { Black: "url", Charcoal: "url" }
  color?: string;
  material?: string;
  additionalImages?: string[];
  createdAt?: number;
  avgRating?: number;
  reviewCount?: number;
};

export const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;

export function getColors(variants: Record<string, string>): string[] {
  const colors = new Set<string>();
  for (const key of Object.keys(variants)) {
    if (key.includes("-")) colors.add(key.split("-")[0]);
  }
  return [...colors];
}

export function getSizesForColor(variants: Record<string, string>, color: string): string[] {
  const prefix = `${color}-`;
  const found = Object.keys(variants)
    .filter((k) => k.startsWith(prefix))
    .map((k) => k.slice(prefix.length));
  // Sort standard sizes first in the right order, then any extras (numeric youth sizes, etc.)
  const sizeOrder = SIZES as readonly string[];
  return [
    ...sizeOrder.filter((s) => found.includes(s)),
    ...found.filter((s) => !sizeOrder.includes(s)).sort(),
  ];
}

export function isColorVariant(variants: Record<string, string>): boolean {
  return Object.keys(variants).some((k) => k.includes("-"));
}
