import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const sa = JSON.parse(readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8"));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

const snap = await db.collection("teedropper_products").get();
for (const doc of snap.docs) {
  const p = doc.data();
  const variantKeys = Object.keys(p.variants || {});
  const colors = [...new Set(variantKeys.map(k => k.split("-")[0]))];
  console.log(`[${doc.id}] ${p.name}`);
  console.log(`  colors: ${colors.join(", ")}`);
  console.log();
}
process.exit(0);
