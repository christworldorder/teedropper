import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8"));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Delete duplicate Black and the Test entry, keep the good one
const toDelete = ["KDVeNUkMIEVOUTGMtloC", "8c8DpPXTFf6kzIwmNrKo"];

for (const id of toDelete) {
  await db.collection("teedropper_products").doc(id).delete();
  console.log("Deleted:", id);
}

// Add Charcoal
const ref = await db.collection("teedropper_products").add({
  name: "Barbie Jitsu - Charcoal",
  description: "The Barbie Jitsu tee in charcoal.",
  price: 29.99,
  tag: "New Drop",
  image: "",
  variants: {
    XS: "5434236531",
    S: "5434236532",
    M: "5434236533",
    L: "5434236534",
    XL: "5434236535",
    "2XL": "5434236536",
    "3XL": "5434236537",
  },
  createdAt: Date.now(),
});
console.log("Added Charcoal:", ref.id);

process.exit(0);
