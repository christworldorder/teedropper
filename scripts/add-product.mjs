import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const match = env.match(/FIREBASE_SERVICE_ACCOUNT='(.+?)'\s*$/ms) || env.match(/FIREBASE_SERVICE_ACCOUNT=(.+)/);
const serviceAccount = JSON.parse(match[1].replace(/\\n/g, '\n'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const product = {
  name: 'Murder Yoga',
  description: 'BJJ is just murder yoga. And you love it.',
  price: 29.99,
  image: 'https://files.cdn.printful.com/files/916/9161d50e34f751bd4a45114f89275e50_preview.png',
  tag: 'Limited Run',
  variants: {
    XS: '5437139902',
    S: '5437139903',
    M: '5437139904',
    L: '5437139905',
    XL: '5437139906',
    '2XL': '5437139907',
    '3XL': '5437139908',
  },
  createdAt: Date.now(),
};

const ref = await db.collection('teedropper_products').add(product);
console.log('Added:', ref.id);
process.exit(0);
