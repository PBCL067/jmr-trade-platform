import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  // TODO: paste your config values from the Firebase console
  apiKey: "REPLACE_ME",
  authDomain: "jmr-global-abcce.firebaseapp.com",
  projectId: "jmr-global-abcce",
  storageBucket: "jmr-global-abcce.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function fetchCollection(collectionName) {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchDoc(collectionName, docId) {
  const snap = await getDoc(doc(db, collectionName, docId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
