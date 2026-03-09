import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
  setDoc,
  writeBatch,
  limit,
  WhereFilterOp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";

// --------------- Generic CRUD ---------------

export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function setDocument<T extends DocumentData>(
  collectionName: string,
  id: string,
  data: T,
  merge = true
): Promise<void> {
  await setDoc(
    doc(db, collectionName, id),
    { ...data, updatedAt: serverTimestamp() },
    { merge }
  );
}

export async function updateDocument(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

export async function getDocument<T>(
  collectionName: string,
  id: string
): Promise<(T & { id: string }) | null> {
  const snap = await getDoc(doc(db, collectionName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T & { id: string };
}

export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T & { id: string });
}

// --------------- Real-time listener ---------------

export function subscribeToCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: (T & { id: string })[]) => void
): () => void {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T & { id: string });
    callback(docs);
  });
}

export function subscribeToDocument<T>(
  collectionName: string,
  id: string,
  callback: (data: (T & { id: string }) | null) => void
): () => void {
  return onSnapshot(doc(db, collectionName, id), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ id: snap.id, ...snap.data() } as T & { id: string });
  });
}

// --------------- File upload ---------------

export async function uploadFile(
  path: string,
  file: File
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

// --------------- Batch operations ---------------

export async function batchUpdate(
  operations: { collection: string; id: string; data: Record<string, unknown> }[]
): Promise<void> {
  const batch = writeBatch(db);
  for (const op of operations) {
    batch.update(doc(db, op.collection, op.id), {
      ...op.data,
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

// --------------- Query helpers ---------------

export { collection, query, where, orderBy, limit, serverTimestamp, Timestamp };
export type { WhereFilterOp };

// --------------- Create user with Auth account ---------------
// Uses Firebase REST API so it doesn't sign out the current admin session
const FIREBASE_API_KEY = "AIzaSyDYKT5wXPLlQvhFyrFqcr48ru-x0tCLCOo";
const FIREBASE_PROJECT_ID = "lawfirmerp-8190c";

export async function createUserWithAuth(
  email: string,
  password: string,
  profileData: Record<string, unknown>
): Promise<string> {
  // 1. Create the Auth account via REST (won't affect current session)
  const authRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName: profileData.displayName, returnSecureToken: true }),
    }
  );
  const authData = await authRes.json();
  if (authData.error) throw new Error(authData.error.message);

  const uid = authData.localId;
  const idToken = authData.idToken;

  // 2. Write Firestore profile doc keyed by UID via REST
  const firestoreBody = {
    fields: Object.fromEntries(
      Object.entries({ ...profileData, uid, email, createdAt: new Date().toISOString() }).map(([k, v]) => [
        k,
        typeof v === "boolean" ? { booleanValue: v } :
        typeof v === "number" ? { integerValue: String(v) } :
        { stringValue: String(v ?? "") },
      ])
    ),
  };

  await fetch(
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify(firestoreBody),
    }
  );

  return uid;
}
