import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const sa = JSON.parse(readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8"));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

// color: what Meta shows buyers
// material: fabric composition from Printful product specs
const updates = {
  // ── TEES ──────────────────────────────────────────────────────────────────
  "1FzdrwUfF8BPmUayRxzT": { color: "Black", material: "100% Cotton" },           // Submit Pass Sweep Repeat
  "4BYAwxYTQjTwYdKWFOyk": { color: "Black", material: "100% Cotton" },           // Unga Bunga
  "75byo8CJymvEJAE1eksM": { color: "Black", material: "100% Cotton" },           // Murder Yoga
  "84iTmY7LLBdDYLuYxFQZ": { color: "Black", material: "100% Cotton" },           // Just Creatine Bro
  "BdrNJwLhlX1Hg9LTM0kO": { color: "Black", material: "100% Cotton" },           // IGBBMN Blue Belt
  "DU2npGBfiob9gyT6fIup": { color: "Black", material: "100% Cotton" },           // Spazzy Blue Belt
  "DgZw4inWRp8kgF2foeP3": { color: "Black", material: "100% Cotton" },           // Christ is King
  "DyChkIMDEaAF3iCoHA3a": { color: "Black", material: "100% Cotton" },           // I See Red
  "Eb7VEldSmdB7kv7w33To": { color: "Black", material: "100% Cotton" },           // Just One More Round - White Belt
  "MJRIbGmLQxbVGhNsPlkf": { color: "Black", material: "100% Cotton" },           // Mentally Ill Physically Strong
  "O0jhZuijMBbsuEDhSI75": { color: "Black, Charcoal", material: "100% Cotton" }, // Girl Jitsu (2 colors)
  "VtoabpWRKWxvawCRmxg9": { color: "Black", material: "100% Cotton" },           // Christ First
  "o0v2mVJZKKCw5UtfBS3i": { color: "Black", material: "100% Cotton" },           // Lift It or Die
  "pXW1IjpJE3HU8Xrs1dmO": { color: "Black", material: "100% Cotton" },           // IGBBMN White Belt
  "xXdlDWgwMMBbAumYu1Rn": { color: "Black", material: "100% Cotton" },           // Just One More Round
  "0t4fMkHKkaC8Dmx26GTK": { color: "Black", material: "100% Cotton" },           // Christ is King - Women's
  "ViY8TgVECfST6vA5k6X3": { color: "Black", material: "100% Cotton" },           // Grappling Club

  // ── CAMO TEES ─────────────────────────────────────────────────────────────
  "r9AU2Yt12ASPLvPlSQXv": { color: "Camo", material: "100% Cotton" },            // Camo Submit Repeat

  // ── HOODIES & SWEATSHIRTS ─────────────────────────────────────────────────
  "0qQI5xNuYLKar8EWbTx3": { color: "Camo", material: "50% Cotton, 50% Polyester" },   // Christ is King Camo Hoodie
  "QnrX1BZ0DixXox6swp4w": { color: "Black", material: "50% Cotton, 50% Polyester" },  // Submit and Repeat Camo Hoodie
  "7KSr5MraUmn6POckcESC": { color: "Black", material: "50% Cotton, 50% Polyester" },  // Christ is King Sweatshirt
  "zzYtTuR1KRbopEgwpzIK": { color: "Black", material: "50% Cotton, 50% Polyester" },  // Christ is King Hoodie

  // ── TANK TOPS ─────────────────────────────────────────────────────────────
  "Kg1gSflKZ9RRv0AGOYfj": { color: "Black", material: "100% Polyester" },        // Grappling Club Tank Top

  // ── RASH GUARDS (all-over print) ──────────────────────────────────────────
  "3RpsGCfrATBlLpHNlZQ9": { color: "Multicolor", material: "82% Polyester, 18% Spandex" }, // All Over Girl
  "BPQoWyZQ9xYG6123ZZa5": { color: "Multicolor", material: "82% Polyester, 18% Spandex" }, // Cheetah
  "Ck6Nn2SD7vOPR3ml53oh": { color: "Multicolor", material: "82% Polyester, 18% Spandex" }, // Girl Jitsu rash guard
  "T0p5bav8qm3OvXq4LTy5": { color: "Black", material: "82% Polyester, 18% Spandex" },     // Grappling Club Rash Guard
  "XShBm4KhENOCRoRqbU2l": { color: "Black", material: "82% Polyester, 18% Spandex" },     // Just One More Round Women's
  "ob0cdXbBDvUQjIxdcPbB": { color: "Camo", material: "82% Polyester, 18% Spandex" },      // Men's Rash Guard - Camo
  "qcTMtN1vpHyxfeieU4jI": { color: "Multicolor", material: "82% Polyester, 18% Spandex" },// Women's Christ is King
  "w1i371F9gghAKhGB78kR": { color: "Multicolor", material: "82% Polyester, 18% Spandex" },// Girl Murder Yoga

  // ── YOUTH / KIDS RASH GUARDS ──────────────────────────────────────────────
  "MkyjEFG1Lm2c1myzLgYY": { color: "Camo", material: "82% Polyester, 18% Spandex" },      // Youth Rash Guard - Camo
  "XsKRAb2Tjdxr55nadt4c": { color: "Camo", material: "82% Polyester, 18% Spandex" },      // Submit & Repeat Camo Youth
  "ljsobxCVNzQb8jXLkaoU": { color: "Camo", material: "82% Polyester, 18% Spandex" },      // Kids Rash Guard - Camo
  "oB16X6Z8b78Z3XXC0Cei": { color: "Camo", material: "82% Polyester, 18% Spandex" },      // Submit & Repeat Kids Camo

  // ── FLAGS ─────────────────────────────────────────────────────────────────
  "31ElK1sMum8KBleTFmT7": { color: "Black", material: "100% Polyester" },        // Combat Sports Club Flag
  "iJh3oDiqgK7Fdzb1Y18s": { color: "Black", material: "100% Polyester" },        // Grappling Girls Club Flag
  "mTbzPVVIodavmrNwyP3t": { color: "Black", material: "100% Polyester" },        // Grappling Club Flag
  "q1qfyoMT3gRW4yDcbjW9": { color: "Black", material: "100% Polyester" },        // Girl Grappling Club Flag
  "vIByZehuaSadPkADX34I": { color: "Black", material: "100% Polyester" },        // Iron Sharpens Iron Flag
};

let updated = 0;
for (const [id, patch] of Object.entries(updates)) {
  await db.collection("teedropper_products").doc(id).update(patch);
  console.log(`✓ [${id}] color: ${patch.color} | material: ${patch.material}`);
  updated++;
}

console.log(`\nDone. ${updated}/40 updated.`);
process.exit(0);
