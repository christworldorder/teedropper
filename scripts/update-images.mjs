import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const updates = [
  {
    id: "O0jhZuijMBbsuEDhSI75", // Black
    image: "https://files.cdn.printful.com/files/4d5/4d5f11ed2833319264a1acd29a6bb9e0_preview.png",
  },
  {
    id: "MZcF5RZVrGzy3CQ2laEv", // Charcoal
    image: "https://files.cdn.printful.com/files/424/424a88e313db6025ded168c4997bbeb3_preview.png",
  },
];

for (const { id, image } of updates) {
  await db.collection("teedropper_products").doc(id).update({ image });
  console.log("Updated:", id);
}

process.exit(0);
