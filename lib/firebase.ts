import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDYKT5wXPLlQvhFyrFqcr48ru-x0tCLCOo",
  authDomain: "lawfirmerp-8190c.firebaseapp.com",
  projectId: "lawfirmerp-8190c",
  storageBucket: "lawfirmerp-8190c.firebasestorage.app",
  messagingSenderId: "554405331330",
  appId: "1:554405331330:web:bd9a434a37859233ed4f9b",
  measurementId: "G-4CQ7H9TM1B",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const initAnalytics = async () => {
  if (typeof window !== "undefined" && (await isSupported())) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
