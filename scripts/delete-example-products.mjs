import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8")
);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const toDelete = [
  "f8SvsdY74h42Duvnp5ZY", // Tap or Snap
  "nGlM7UDxRcCeDtKFp1sh", // God Over Everything
  "h0KUsc1w9s9VuPgDiUYS", // Lift Heavy Pray Hard
  "RYOQrcMBkBAjELeV42lF", // Main Character Energy
  "ZglYeRTVWlvZ0EOYhGmZ", // NPC Mode: Off
  "6rugdhp5q8xnUis4zgBg", // Touch Grass Champion
];

for (const id of toDelete) {
  await db.collection("teedropper_products").doc(id).delete();
  console.log("Deleted:", id);
}

console.log("Done.");
process.exit(0);
