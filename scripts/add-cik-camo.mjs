import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const match = env.match(/FIREBASE_SERVICE_ACCOUNT='(.+?)'\s*$/ms) || env.match(/FIREBASE_SERVICE_ACCOUNT=(.+)/);
const serviceAccount = JSON.parse(match[1].replace(/\\n/g, '\n'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const product = {
  name: "Christ is King Camo",
  description: "Camo-filled gothic lettering on a premium black CVC tee. Bold faith, built for the mat and the street. Wear what you stand for.",
  price: 29.99,
  image: "/unisex-cvc-t-shirt-black-front-6a83948a47d27.webp",
  additionalImages: [
    "/unisex-cvc-t-shirt-black-front-6a83948a47383.webp",
  ],
  tag: "Faith",
  category: "mens",
  color: "Black",
  material: "CVC blend (52% cotton, 48% polyester)",
  variants: {
    "XS": "5444593850",
    "S":  "5444593851",
    "M":  "5444593852",
    "L":  "5444593853",
    "XL": "5444593854",
    "2XL":"5444593855",
    "3XL":"5444593856",
  },
  createdAt: Date.now(),
};

const ref = await db.collection('teedropper_products').add(product);
console.log('Added:', ref.id);
process.exit(0);
