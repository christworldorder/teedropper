import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _db: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (!_db) {
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert(JSON.parse(Buffer.from(process.env["FIREBASE_SERVICE_ACCOUNT"]!, "base64").toString("utf8"))),
        });
    _db = getFirestore(app);
  }
  return _db;
}
