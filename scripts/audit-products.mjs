import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8")
);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const snap = await db.collection("teedropper_products").get();
const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));

console.log(`Total products: ${products.length}\n`);

for (const p of products) {
  const imgAbsolute = p.image?.startsWith("http");
  const descLen = (p.description || "").length;
  const hasMojibake = /[\u00c2-\u00c3][\u0080-\u00bf]|\uFFFD|â€/.test(p.description || "");

  const flags = [];
  if (!imgAbsolute) flags.push("RELATIVE_IMAGE");
  if (descLen < 100) flags.push(`SHORT_DESC(${descLen})`);
  if (hasMojibake) flags.push("MOJIBAKE");
  if (/barbie/i.test(p.name)) flags.push("TRADEMARK");

  console.log(`[${p.id}] ${p.name}`);
  console.log(`  image: ${p.image}`);
  console.log(`  desc(${descLen}): ${p.description}`);
  if (flags.length) console.log(`  *** FLAGS: ${flags.join(", ")} ***`);
  console.log();
}
process.exit(0);
