import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiTQzWKFlbrYL7KntdqQT1ZQHwRtmoINc",
  authDomain: "christ-world-order.firebaseapp.com",
  projectId: "christ-world-order",
  storageBucket: "christ-world-order.firebasestorage.app",
  messagingSenderId: "454156043389",
  appId: "1:454156043389:web:88cb12c50de5c0a3991d14",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const variants = {
  XS:  "5434231298",
  S:   "5434231299",
  M:   "5434231300",
  L:   "5434231301",
  XL:  "5434231302",
  "2XL": "5434231303",
  "3XL": "5434231304",
};

const snap = await getDocs(collection(db, "teedropper_products"));

if (snap.empty) {
  console.log("No products found.");
  process.exit(1);
}

for (const d of snap.docs) {
  console.log(`Updating: ${d.id} — ${d.data().name}`);
  await updateDoc(doc(db, "teedropper_products", d.id), { variants });
  console.log("Done.");
}

process.exit(0);
