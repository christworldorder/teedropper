import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8")
);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Placeholder variant IDs — replace with real Printful IDs before going live
function fakeVariants(prefix) {
  const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
  const variants = {};
  sizes.forEach((s, i) => { variants[s] = `${prefix}${i}`; });
  return variants;
}

const products = [
  {
    name: "Tap or Snap",
    description: "For the grappler who doesn't tap — until they do. Classic BJJ statement tee.",
    price: 29.99,
    tag: "Trending",
    image: "",
    variants: fakeVariants("111111000"),
    createdAt: Date.now() - 1000,
  },
  {
    name: "God Over Everything",
    description: "Faith first. Always. Minimalist Christian tee built for everyday wear.",
    price: 27.99,
    tag: "Hot",
    image: "",
    variants: fakeVariants("222222000"),
    createdAt: Date.now() - 2000,
  },
  {
    name: "Lift Heavy Pray Hard",
    description: "The gym is the church. The iron is the sermon. Show up every day.",
    price: 27.99,
    tag: "Viral",
    image: "",
    variants: fakeVariants("333333000"),
    createdAt: Date.now() - 3000,
  },
  {
    name: "Main Character Energy",
    description: "You're not a side quest. Walk into every room like the plot revolves around you.",
    price: 29.99,
    tag: "Trending",
    image: "",
    variants: fakeVariants("444444000"),
    createdAt: Date.now() - 4000,
  },
  {
    name: "NPC Mode: Off",
    description: "Stop following the script. Think for yourself. Limited run for the awake ones.",
    price: 29.99,
    tag: "Limited",
    image: "",
    variants: fakeVariants("555555000"),
    createdAt: Date.now() - 5000,
  },
  {
    name: "Touch Grass Champion",
    description: "Certified outdoor experience haver. Sometimes. Mostly just wearing this indoors.",
    price: 25.99,
    tag: "Hot",
    image: "",
    variants: fakeVariants("666666000"),
    createdAt: Date.now() - 6000,
  },
];

for (const p of products) {
  const ref = await db.collection("teedropper_products").add(p);
  console.log(`Added: "${p.name}" — ${ref.id}`);
}

console.log(`\nDone. ${products.length} products added.`);
console.log("Reminder: replace placeholder variant IDs with real Printful IDs before launch.");
process.exit(0);
