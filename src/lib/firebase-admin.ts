import "server-only";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _db: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (!_db) {
    const raw = process.env["FIREBASE_SERVICE_ACCOUNT"];
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT missing at runtime");
    const serviceAccount = JSON.parse(
      raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")
    );
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({ credential: cert(serviceAccount) });
    _db = getFirestore(app);
  }
  return _db;
}
