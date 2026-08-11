import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8")
);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const KEEP_ID = "O0jhZuijMBbsuEDhSI75";   // Black — we keep this doc
const DELETE_ID = "MZcF5RZVrGzy3CQ2laEv"; // Charcoal — gets merged in then deleted

// Variant IDs from Printful
const variants = {
  "Black-XS":  "5434231298",
  "Black-S":   "5434231299",
  "Black-M":   "5434231300",
  "Black-L":   "5434231301",
  "Black-XL":  "5434231302",
  "Black-2XL": "5434231303",
  "Black-3XL": "5434231304",
  "Charcoal-XS":  "5434236531",
  "Charcoal-S":   "5434236532",
  "Charcoal-M":   "5434236533",
  "Charcoal-L":   "5434236534",
  "Charcoal-XL":  "5434236535",
  "Charcoal-2XL": "5434236536",
  "Charcoal-3XL": "5434236537",
};

const colorImages = {
  Black:    "https://files.cdn.printful.com/files/4d5/4d5f11ed2833319264a1acd29a6bb9e0_preview.png",
  Charcoal: "https://files.cdn.printful.com/files/424/424a88e313db6025ded168c4997bbeb3_preview.png",
};

// Update the keeper doc with merged data
await db.collection("teedropper_products").doc(KEEP_ID).update({
  name: "Barbie Jitsu",
  description: "The Barbie Jitsu tee.",
  price: 29.99,
  tag: "New Drop",
  image: colorImages.Black,
  variants,
  colorImages,
  createdAt: Date.now(),
});
console.log("Updated merged product:", KEEP_ID);

// Delete the now-redundant Charcoal doc
await db.collection("teedropper_products").doc(DELETE_ID).delete();
console.log("Deleted old Charcoal doc:", DELETE_ID);

console.log("Migration complete. One product with 14 variants.");
process.exit(0);
