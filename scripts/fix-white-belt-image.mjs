import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8")
);
initializeApp({ credential: cert(serviceAccount), storageBucket: "christ-world-order.firebasestorage.app" });

const db = getFirestore();
const mockup = "https://files.cdn.printful.com/files/ea9/ea933c47fdb0fa500ef96bb10d0c5ba7_preview.png";

await db.collection("teedropper_products").doc("pXW1IjpJE3HU8Xrs1dmO").update({
  image: mockup,
  colorImages: { Black: mockup },
});

console.log("Updated white belt image.");
process.exit(0);
