/**
 * Uploads Reformation Camo Hoodie mockups to Firebase Storage
 * and creates the product doc in Firestore.
 *
 * Mockups source: C:\Users\XSilv\Downloads\Reformation Camo Hoodie mockup.zip
 * Printful store product ID: 456498060
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { readFileSync } from "fs";
import { join } from "path";

// ── Firebase init ──────────────────────────────────────────────────────────
const serviceAccount = JSON.parse(
  readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8")
);

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "christ-world-order.firebasestorage.app",
});
const db = getFirestore();
const bucket = getStorage().bucket();

// ── Mockup files ───────────────────────────────────────────────────────────
// Extracted from Reformation Camo Hoodie mockup.zip
const MOCKUPS_DIR = "c:/Users/XSilv/Downloads/Reformation Camo Hoodie mockup";

// Sort: front images first, then back. Within each group largest file (best quality) first.
const MOCKUP_FILES = [
  // primary (main product card image) — front, larger file
  "unisex-heavy-blend-hoodie-black-front-6a83ef9bd92f5.png",
  // additional
  "unisex-heavy-blend-hoodie-black-front-6a83ef9bd9639.png",
  "unisex-heavy-blend-hoodie-black-back-6a83ef9bd94af.png",
  "unisex-heavy-blend-hoodie-black-back-6a83ef9bd97e8.png",
];

// ── Product data ───────────────────────────────────────────────────────────
const VARIANTS = {
  S:   "5444986187",
  M:   "5444986188",
  L:   "5444986189",
  XL:  "5444986190",
  "2XL": "5444986191",
  "3XL": "5444986192",
  "4XL": "5444986193",
  "5XL": "5444986194",
};

const DESCRIPTION =
  "The Reformation Camo Hoodie is built for the ones who haven't forgotten " +
  "what the Church was meant to be. Military-grade camo pattern meets premium " +
  "heavyweight fleece on a unisex pullover that wears like armor. Double-lined " +
  "hood, kangaroo front pocket, and a relaxed fit made to move. Wear it to the " +
  "gym, the mat, or anywhere your convictions are tested. Unisex sizing — runs " +
  "true to size. 50% cotton, 50% polyester. Printed and shipped from the US in " +
  "5–10 business days. Bold faith. Built for the remnant.";

// ── Upload helper ──────────────────────────────────────────────────────────
async function uploadFile(localPath, destPath) {
  await bucket.upload(localPath, {
    destination: destPath,
    metadata: { cacheControl: "public, max-age=31536000" },
  });
  await bucket.file(destPath).makePublic();
  return `https://storage.googleapis.com/christ-world-order.firebasestorage.app/${destPath}`;
}

// ── Main ───────────────────────────────────────────────────────────────────
const FOLDER = "teedropper/reformation-camo-hoodie";
const urls = [];

for (const relPath of MOCKUP_FILES) {
  const localPath = join(MOCKUPS_DIR, relPath);
  const filename = relPath.split("/").pop() ?? relPath;
  const destPath = `${FOLDER}/${filename}`;
  try {
    const url = await uploadFile(localPath, destPath);
    urls.push(url);
    console.log(`✓ Uploaded: ${filename}`);
  } catch (err) {
    console.error(`✗ Failed: ${filename}:`, err.message);
    process.exit(1);
  }
}

const [image, ...additionalImages] = urls;

const ref = await db.collection("teedropper_products").add({
  name: "Reformation Camo Hoodie",
  description: DESCRIPTION,
  price: 49.99,
  tag: "New Drop",
  category: "hoodies",
  color: "Black",
  material: "50% cotton, 50% polyester",
  image,
  additionalImages,
  variants: VARIANTS,
  createdAt: Date.now(),
});

console.log(`\n✓ Product created: ${ref.id}`);
console.log(`  Image:  ${image}`);
console.log(`  + ${additionalImages.length} additional images`);
console.log(`  Variants: S M L XL 2XL 3XL 4XL 5XL`);
process.exit(0);
