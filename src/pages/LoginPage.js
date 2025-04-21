import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { getDoc, doc, getFirestore, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const db = getFirestore();
const provider = new GoogleAuthProvider();

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let role = "guest";

      if (userSnap.exists()) {
        role = userSnap.data().role || "guest";
      } else {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          role: "guest",
        });
      }

      await addDoc(collection(db, "loginLogs"), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        timestamp: serverTimestamp()
      });

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
      backgroundColor: "#003087", // สีน้ำเงินหลัก
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "50px 60px",
        borderRadius: 16,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
        maxWidth: 420
      }}>
        <img
          src="/streamwash-logo.png" // 👈 ให้คุณนำโลโก้ไปวางไว้ใน public folder ด้วยชื่อไฟล์นี้
          alt="Streamwash Logo"
          style={{ width: 100, marginBottom: 20 }}
        />
        <h2 style={{
          fontSize: 24,
          marginBottom: 16,
          color: "#003087"
        }}>เข้าสู่ระบบด้วยบัญชี Google</h2>

        <p style={{
          fontSize: 14,
          marginBottom: 30,
          color: "#555"
        }}>
          ยินดีต้อนรับเข้าสู่ระบบจัดการแดชบอร์ด บริษัท สทรีมวอช (ประเทศไทย) จำกัด
        </p>

        <button
          onClick={handleLogin}
          style={{
            backgroundColor: "#1E90FF",
            color: "#fff",
            padding: "12px 28px",
            fontSize: 16,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            transition: "0.3s ease",
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#187bcd"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1E90FF"}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
