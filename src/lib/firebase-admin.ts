import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _db: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (!_db) {
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert(JSON.parse(process.env["FIREBASE_SERVICE_ACCOUNT"]!)),
        });
    _db = getFirestore(app);
  }
  return _db;
}
