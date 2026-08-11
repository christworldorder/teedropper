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

// Delete the bad product we added earlier (wrong hex variant IDs, wrong image)
await db.collection("teedropper_products").doc("U9t067UWjN7CglCXK9hP").delete();
console.log("Deleted bad product.");

// Add correct product
const mockupUrl = "https://files.cdn.printful.com/files/629/62904987bee0a999f94a93f9b95259c1_preview.png";

const variants = {
  "Black-XS":  "5434392134",
  "Black-S":   "5434392135",
  "Black-M":   "5434392136",
  "Black-L":   "5434392137",
  "Black-XL":  "5434392138",
  "Black-2XL": "5434392139",
  "Black-3XL": "5434392140",
};

const ref = await db.collection("teedropper_products").add({
  name: "Just One More Round",
  description: "The grappler's anthem. Skeleton in a gi, always ready for one more. Classic BJJ tee.",
  price: 29.99,
  tag: "Trending",
  image: mockupUrl,
  variants,
  colorImages: { Black: mockupUrl },
  createdAt: Date.now(),
});

console.log("Added JOMR product:", ref.id);
console.log("Done.");
process.exit(0);
