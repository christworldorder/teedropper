import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8")
);
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "christ-world-order.firebasestorage.app",
});

const db = getFirestore();
const bucket = getStorage().bucket();

// Upload image to Firebase Storage
const imagePath = "C:/Users/XSilv/Downloads/barbie jitsu.png";
const destination = `teedropper/barbie-jitsu-v2-${Date.now()}.png`;

console.log("Uploading image...");
await bucket.upload(imagePath, {
  destination,
  metadata: { contentType: "image/png" },
});

// Make it publicly readable
const file = bucket.file(destination);
await file.makePublic();
const imageUrl = `https://storage.googleapis.com/christ-world-order.firebasestorage.app/${destination}`;
console.log("Image uploaded:", imageUrl);

// Variant IDs from Printful (new Barbie Jitsu - Black shirt)
const variants = {
  "Black-XS":  "6a7971828ea4a4",
  "Black-S":   "6a7971828ea4c4",
  "Black-M":   "6a7971828ea4d6",
  "Black-L":   "6a7971828ea4e5",
  "Black-XL":  "6a7971828ea4f7",
  "Black-2XL": "6a7971828ea502",
  "Black-3XL": "6a7971828ea511",
};

const colorImages = {
  Black: imageUrl,
};

const product = {
  name: "Barbie Jitsu",
  description: "Barbie throwing hands on the mat. The ultimate BJJ tee.",
  price: 29.99,
  tag: "New Drop",
  image: imageUrl,
  variants,
  colorImages,
  createdAt: Date.now(),
};

const ref = await db.collection("teedropper_products").add(product);
console.log("Product added to Firestore:", ref.id);
console.log("Done! Visit teedropper.com/shop to see it.");
process.exit(0);
