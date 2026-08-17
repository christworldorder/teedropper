import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const sa = JSON.parse(readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8"));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

// niche drives custom_label_0 → campaign segmentation in Meta Ads
const niches = {
  // ── faith ──────────────────────────────────────────────────────────────────
  "0qQI5xNuYLKar8EWbTx3": "faith",  // Christ is King Camo Hoodie
  "0t4fMkHKkaC8Dmx26GTK": "faith",  // Christ is King - Women's
  "7KSr5MraUmn6POckcESC": "faith",  // Christ is King Sweatshirt
  "DgZw4inWRp8kgF2foeP3": "faith",  // Christ is King
  "VtoabpWRKWxvawCRmxg9": "faith",  // Christ First
  "vIByZehuaSadPkADX34I": "faith",  // Iron Sharpens Iron Flag
  "zzYtTuR1KRbopEgwpzIK": "faith",  // Christ is King Hoodie
  "qcTMtN1vpHyxfeieU4jI": "faith",  // Women's Rash Guard - Christ is King

  // ── bjj ────────────────────────────────────────────────────────────────────
  "1FzdrwUfF8BPmUayRxzT": "bjj",   // Submit Pass Sweep Repeat
  "3RpsGCfrATBlLpHNlZQ9": "bjj",   // Women's Rash Guard - All Over Girl
  "75byo8CJymvEJAE1eksM": "bjj",   // Murder Yoga
  "BPQoWyZQ9xYG6123ZZa5": "bjj",   // Cheetah Rash Guard
  "BdrNJwLhlX1Hg9LTM0kO": "bjj",   // IGBBMN - Blue Belt
  "Ck6Nn2SD7vOPR3ml53oh": "bjj",   // Women's Rash Guard - Girl Jitsu
  "DU2npGBfiob9gyT6fIup": "bjj",   // Spazzy Blue Belt
  "Eb7VEldSmdB7kv7w33To": "bjj",   // Just One More Round - White Belt
  "Kg1gSflKZ9RRv0AGOYfj": "bjj",   // Grappling Club Tank Top
  "MkyjEFG1Lm2c1myzLgYY": "bjj",   // Youth Rash Guard - Camo
  "O0jhZuijMBbsuEDhSI75": "bjj",   // Girl Jitsu
  "QnrX1BZ0DixXox6swp4w": "bjj",   // Submit and Repeat Camo Hoodie
  "T0p5bav8qm3OvXq4LTy5": "bjj",   // Grappling Club Rash Guard
  "ViY8TgVECfST6vA5k6X3": "bjj",   // Grappling Club
  "XShBm4KhENOCRoRqbU2l": "bjj",   // Just One More Round - Women's Rash Guard
  "XsKRAb2Tjdxr55nadt4c": "bjj",   // Submit & Repeat Camo Youth Rash Guard
  "iJh3oDiqgK7Fdzb1Y18s": "bjj",   // Grappling Girls Club Flag
  "ljsobxCVNzQb8jXLkaoU": "bjj",   // Kids Rash Guard - Camo
  "mTbzPVVIodavmrNwyP3t": "bjj",   // Grappling Club Flag
  "oB16X6Z8b78Z3XXC0Cei": "bjj",   // Submit & Repeat Kids Camo Rash Guard
  "ob0cdXbBDvUQjIxdcPbB": "bjj",   // Men's Rash Guard - Camo
  "pXW1IjpJE3HU8Xrs1dmO": "bjj",   // IGBBMN - White Belt
  "q1qfyoMT3gRW4yDcbjW9": "bjj",   // Girl Grappling Club Flag
  "r9AU2Yt12ASPLvPlSQXv": "bjj",   // Camo Submit Repeat
  "w1i371F9gghAKhGB78kR": "bjj",   // Girl Murder Yoga
  "xXdlDWgwMMBbAumYu1Rn": "bjj",   // Just One More Round

  // ── fitness ─────────────────────────────────────────────────────────────────
  "4BYAwxYTQjTwYdKWFOyk": "fitness", // Unga Bunga
  "84iTmY7LLBdDYLuYxFQZ": "fitness", // Just Creatine Bro
  "MJRIbGmLQxbVGhNsPlkf": "fitness", // Mentally Ill Physically Strong
  "o0v2mVJZKKCw5UtfBS3i": "fitness", // Lift It or Die

  // ── mma ─────────────────────────────────────────────────────────────────────
  "31ElK1sMum8KBleTFmT7": "mma",    // Combat Sports Club Flag
  "DyChkIMDEaAF3iCoHA3a": "mma",    // I See Red
};

let updated = 0;
for (const [id, niche] of Object.entries(niches)) {
  await db.collection("teedropper_products").doc(id).update({ niche });
  console.log(`✓ [${id}] niche: ${niche}`);
  updated++;
}
console.log(`\nDone. ${updated}/40`);
process.exit(0);
