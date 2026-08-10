export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tag: string;
  variants: Record<string, string>; // { XS: "5434231298", S: "5434231299", ... }
  createdAt?: number;
};

export const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;
