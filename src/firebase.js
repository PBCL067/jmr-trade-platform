import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "jmr-global-abcce.firebaseapp.com",
  projectId: "jmr-global-abcce",
  storageBucket: "jmr-global-abcce.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function fetchCollection(collectionName) {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchDoc(collectionName, docId) {
  const snap = await getDoc(doc(db, collectionName, docId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addDocument(collectionName, data) {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDocument(collectionName, docId, data) {
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteDocument(collectionName, docId) {
  await deleteDoc(doc(db, collectionName, docId));
}

export async function uploadSpec(supplierId, file) {
  const path = `specs/${supplierId}/${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path, name: file.name };
}

export async function getSupplierSpecs(supplierId) {
  try {
    const folderRef = ref(storage, `specs/${supplierId}`);
    const result = await listAll(folderRef);
    const specs = await Promise.all(
      result.items.map(async (item) => ({
        name: item.name,
        path: item.fullPath,
        url: await getDownloadURL(item),
      }))
    );
    return specs;
  } catch {
    return [];
  }
}
