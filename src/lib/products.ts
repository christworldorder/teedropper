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
  createdAt?: number;
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
  return SIZES.filter((s) => variants[`${color}-${s}`]);
}

export function isColorVariant(variants: Record<string, string>): boolean {
  return Object.keys(variants).some((k) => k.includes("-"));
}
