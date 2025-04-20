import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { getDoc, doc, getFirestore, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// const auth = getAuth();
const db = getFirestore();
const provider = new GoogleAuthProvider();

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) return;

      // 🔎 เช็ก role จาก Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let role = "guest";

      if (userSnap.exists()) {
        role = userSnap.data().role || "guest";
      } else {
        // ✅ หากยังไม่มีใน Firestore → สร้างใหม่
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          role: "guest",
        });
      }

      // หลังจากเช็กหรือสร้าง role แล้ว
      await addDoc(collection(db, "loginLogs"), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        timestamp: serverTimestamp()
      });

      // 🔁 นำทางตาม role
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error", error);
      alert("เข้าสู่ระบบไม่สำเร็จ");
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f0f4f8"
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "40px 50px",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: 24, marginBottom: 20 }}>🔐 เข้าสู่ระบบด้วย Google</h2>
        <p style={{ fontSize: 14, marginBottom: 30, color: "#555" }}>
          กรุณาเข้าสู่ระบบเพื่อเข้าใช้งานระบบแดชบอร์ดภายในองค์กรของคุณ
        </p>
        <button
          onClick={handleLogin}
          style={{
            backgroundColor: "#4285F4",
            color: "#fff",
            padding: "12px 24px",
            fontSize: 16,
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
