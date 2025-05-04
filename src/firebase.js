import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCMcOtGg4gaSa4co_rzirF8VsAAtXkGPsg",
  authDomain: "dashboard-app-19e56.firebaseapp.com",
  projectId: "dashboard-app-19e56",
  storageBucket: "dashboard-app-19e56.firebasestorage.app",
  messagingSenderId: "781001175263",
  appId: "1:781001175263:web:e697b34b17daf1e1b1f96a",
  measurementId: "G-Y7JT1SZC6G"
};

// ✅ ป้องกัน initialize ซ้ำอย่างถูกต้อง
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "us-central1");
