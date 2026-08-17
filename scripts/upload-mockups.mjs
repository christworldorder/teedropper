import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { readFileSync, readdirSync } from "fs";
import { join, basename } from "path";

const sa = JSON.parse(readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8"));
initializeApp({
  credential: cert(sa),
  storageBucket: "christ-world-order.firebasestorage.app",
});
const db = getFirestore();
const bucket = getStorage().bucket();

// Folder name → { firestoreId, label }
const PRODUCT_MAP = {
  "youth camo rashguard and emblem":          { id: "MkyjEFG1Lm2c1myzLgYY", label: "Youth Rash Guard - Camo" },
  "Submit & Repeat Kids Camo Rash Guard":     { id: "oB16X6Z8b78Z3XXC0Cei", label: "Submit & Repeat Kids Camo Rash Guard" },
  "Christ is King Camo Hoodie":               { id: "0qQI5xNuYLKar8EWbTx3", label: "Christ is King Camo Hoodie" },
  "Submit and Repeat Camo Hoodie":            { id: "QnrX1BZ0DixXox6swp4w", label: "Submit and Repeat Camo Hoodie" },
  "Combat Sports Club Flag":                  { id: "31ElK1sMum8KBleTFmT7", label: "Combat Sports Club Flag" },
  "Iron Sharpens Iron Flag":                  { id: "vIByZehuaSadPkADX34I", label: "Iron Sharpens Iron Flag" },
  "Christ First mockups":                     { id: "VtoabpWRKWxvawCRmxg9", label: "Christ First" },
  "Submit Pass Sweep Repeat":                 { id: "1FzdrwUfF8BPmUayRxzT", label: "Submit Pass Sweep Repeat" },
  "Just One More Round - Women's Rash Guard": { id: "XShBm4KhENOCRoRqbU2l", label: "Just One More Round - Women's Rash Guard" },
};

const MOCKUPS_DIR = "c:/Users/XSilv/Downloads/mockups-temp";

async function uploadFile(localPath, destPath) {
  await bucket.upload(localPath, {
    destination: destPath,
    metadata: { cacheControl: "public, max-age=31536000" },
  });
  await bucket.file(destPath).makePublic();
  return `https://storage.googleapis.com/christ-world-order.firebasestorage.app/${destPath}`;
}

let totalUploaded = 0;

for (const [folderName, { id, label }] of Object.entries(PRODUCT_MAP)) {
  const folderPath = join(MOCKUPS_DIR, folderName);
  let files;
  try {
    files = readdirSync(folderPath).filter((f) => f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg"));
  } catch {
    console.warn(`  SKIP: folder not found: ${folderPath}`);
    continue;
  }

  files.sort(); // deterministic order
  const urls = [];

  for (const file of files) {
    const localPath = join(folderPath, file);
    const destPath = `teedropper/${id}/${file}`;
    try {
      const url = await uploadFile(localPath, destPath);
      urls.push(url);
      console.log(`  ✓ ${label} — ${file}`);
      totalUploaded++;
    } catch (err) {
      console.error(`  ✗ ${label} — ${file}:`, err.message);
    }
  }

  if (urls.length > 0) {
    await db.collection("teedropper_products").doc(id).update({ additionalImages: urls });
    console.log(`  → Firestore [${id}] additionalImages: ${urls.length} images\n`);
  }
}

console.log(`\nDone. ${totalUploaded} images uploaded.`);
process.exit(0);
