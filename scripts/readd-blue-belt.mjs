import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8")
);
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const mockup = "https://files.cdn.printful.com/files/d9d/d9dec6fb877f2583bb37d38190ec089d_preview.png";

const ref = await db.collection("teedropper_products").add({
  name: "IGBBMN - Blue Belt",
  description: "I got beat by my neighbor. Two years in and still getting humbled. Blue belt pride.",
  price: 29.99,
  tag: "New",
  image: mockup,
  colorImages: { Black: mockup },
  variants: {
    "Black-XS":  "5434484761",
    "Black-S":   "5434484762",
    "Black-M":   "5434484763",
    "Black-L":   "5434484764",
    "Black-XL":  "5434484765",
    "Black-2XL": "5434484766",
    "Black-3XL": "5434484767",
  },
  createdAt: Date.now(),
});

console.log("Re-added blue belt:", ref.id);
process.exit(0);
