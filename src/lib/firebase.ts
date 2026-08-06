import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBiTQzWKFlbrYL7KntdqQT1ZQHwRtmoINc",
  authDomain: "christ-world-order.firebaseapp.com",
  projectId: "christ-world-order",
  storageBucket: "christ-world-order.firebasestorage.app",
  messagingSenderId: "454156043389",
  appId: "1:454156043389:web:88cb12c50de5c0a3991d14",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
