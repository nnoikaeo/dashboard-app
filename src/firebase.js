// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ กำหนด config ตรงนี้
const firebaseConfig = {
  apiKey: "AIzaSyCZRyxHis9OVIfacCTrgbg_cRbl1afSNiU",
  authDomain: "dashboard-8d8d9.firebaseapp.com",
  projectId: "dashboard-8d8d9",
  storageBucket: "dashboard-8d8d9.firebasestorage.app",
  messagingSenderId: "484283384158",
  appId: "1:484283384158:web:88392f6019d9a6c25dcfcf"
};

// ✅ ป้องกัน initialize ซ้ำ
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : undefined;

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}


export const auth = getAuth();
export const db = getFirestore();
