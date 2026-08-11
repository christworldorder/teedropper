import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8")
);
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "christ-world-order.firebasestorage.app",
});

const db = getFirestore();

const products = [
  {
    name: "I See Red",
    description: "When the red mist hits. BJJ and MMA tee for the competitor who doesn't tap easy.",
    price: 29.99,
    tag: "Trending",
    image: "https://files.cdn.printful.com/files/8ff/8ff5956018a319352e4a9e514dc8b46b_preview.png",
    colorImages: { Black: "https://files.cdn.printful.com/files/8ff/8ff5956018a319352e4a9e514dc8b46b_preview.png" },
    variants: {
      "Black-XS":  "5434473228",
      "Black-S":   "5434473229",
      "Black-M":   "5434473230",
      "Black-L":   "5434473231",
      "Black-XL":  "5434473232",
      "Black-2XL": "5434473233",
      "Black-3XL": "5434473234",
    },
  },
  {
    name: "IGBBMN - White Belt",
    description: "I got beat by my neighbor. The white belt life is real. Represent where it all started.",
    price: 29.99,
    tag: "New",
    image: "https://files.cdn.printful.com/files/72e/72eff4978cc05f5147f0def0ab591187_preview.png",
    colorImages: { Black: "https://files.cdn.printful.com/files/72e/72eff4978cc05f5147f0def0ab591187_preview.png" },
    variants: {
      "Black-XS":  "5434483825",
      "Black-S":   "5434483826",
      "Black-M":   "5434483827",
      "Black-L":   "5434483828",
      "Black-XL":  "5434483829",
      "Black-2XL": "5434483830",
      "Black-3XL": "5434483831",
    },
  },
  {
    name: "IGBBMN - Blue Belt",
    description: "I got beat by my neighbor. Two years in and still getting humbled. Blue belt pride.",
    price: 29.99,
    tag: "New",
    image: "https://files.cdn.printful.com/files/d9d/d9dec6fb877f2583bb37d38190ec089d_preview.png",
    colorImages: { Black: "https://files.cdn.printful.com/files/d9d/d9dec6fb877f2583bb37d38190ec089d_preview.png" },
    variants: {
      "Black-XS":  "5434484761",
      "Black-S":   "5434484762",
      "Black-M":   "5434484763",
      "Black-L":   "5434484764",
      "Black-XL":  "5434484765",
      "Black-2XL": "5434484766",
      "Black-3XL": "5434484767",
    },
  },
];

for (const product of products) {
  const ref = await db.collection("teedropper_products").add({
    ...product,
    createdAt: Date.now(),
  });
  console.log(`Added "${product.name}":`, ref.id);
}

console.log("Done.");
process.exit(0);
