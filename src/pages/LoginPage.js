import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { getDoc, doc, addDoc, collection, serverTimestamp, getFirestore } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const db = getFirestore();
const provider = new GoogleAuthProvider();

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user) return;

      const userRef = doc(db, "users", user.uid); // ✅ ใช้ uid แทน email
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await Swal.fire({
          icon: "error",
          title: "ไม่พบอีเมลนี้ในระบบ",
          text: "กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์การเข้าใช้งาน",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "ตกลง"
        });
        return;
      }

      const userData = userSnap.data();

      if (userData.status !== "active") {
        await Swal.fire({
          icon: "warning",
          title: "ยังไม่ได้ยืนยันการลงทะเบียน",
          text: "กรุณายืนยันการลงทะเบียนก่อนเข้าใช้งาน หรือ ติดต่อผู้ดูแลระบบ",
          confirmButtonColor: "#f39c12",
          confirmButtonText: "ตกลง"
        });
        return;
      }

      // ✅ บันทึก loginLogs พร้อมใช้ name แทน displayName
      await addDoc(collection(db, "loginLogs"), {
        uid: user.uid,
        email: user.email,
        name: userData.name || user.displayName || "", // 👈 ดึงจาก users collection เป็นหลัก
        timestamp: serverTimestamp()
      });

      const role = userData.role || "guest";

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error", error);
      await Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: "กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#d33",
        confirmButtonText: "ตกลง"
      });
      navigate("/login");
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#003087",
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
          src="/streamwash-logo.jpg"
          alt="Streamwash Logo"
          style={{
            width: 100,
            height: 100,
            objectFit: "cover",
            borderRadius: 12,
            marginBottom: 20,
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
          }}
        />
        <h2 style={{ fontSize: 24, marginBottom: 16, color: "#003087" }}>
          เข้าสู่ระบบด้วยบัญชี Google
        </h2>
        <p style={{ fontSize: 14, marginBottom: 30, color: "#555" }}>
          ยินดีต้อนรับเข้าสู่ระบบจัดการแดชบอร์ด
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
