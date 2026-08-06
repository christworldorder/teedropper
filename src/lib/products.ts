export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stripeLink: string;
  tag: string;
};

export const products: Product[] = [
  {
    id: "1",
    name: "Sample Viral Tee #1",
    description: "The tee everyone's talking about. Limited run.",
    price: 29.99,
    image: "",
    stripeLink: "#", // replace with your Stripe payment link
    tag: "Trending",
  },
  {
    id: "2",
    name: "Sample Viral Tee #2",
    description: "Seen everywhere on your feed. Get it before it's gone.",
    price: 29.99,
    image: "",
    stripeLink: "#",
    tag: "Hot",
  },
  {
    id: "3",
    name: "Sample Viral Tee #3",
    description: "Drop culture meets street style.",
    price: 34.99,
    image: "",
    stripeLink: "#",
    tag: "New Drop",
  },
  {
    id: "4",
    name: "Sample Viral Tee #4",
    description: "If you know, you know.",
    price: 29.99,
    image: "",
    stripeLink: "#",
    tag: "Trending",
  },
];
