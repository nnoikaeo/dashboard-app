import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function ConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const confirmEmail = async () => {
      const email = searchParams.get("email");
      if (!email) return setStatus("invalid");
  
      try {
        console.log("🔍 ยืนยันอีเมล:", email);
      
        const inviteQuery = query(collection(db, "invites"), where("email", "==", email));
        const inviteSnap = await getDocs(inviteQuery);
        console.log("🎯 invites found:", inviteSnap.size);
      
        const userQuery = query(collection(db, "users"), where("email", "==", email));
        const userSnap = await getDocs(userQuery);
        console.log("👥 users found:", userSnap.size);
      
        if (userSnap.empty || inviteSnap.empty) {
          return setStatus("not_found");
        }
      
        const inviteDoc = inviteSnap.docs[0];
        const userDoc = userSnap.docs[0];
      
        await updateDoc(inviteDoc.ref, { confirmedAt: new Date() });
        await updateDoc(userDoc.ref, { status: "active" });
      
        console.log("✅ อัปเดตสำเร็จแล้ว");
      
        setStatus("success");
        setTimeout(() => navigate("/login"), 2500);
      } catch (err) {
        console.error("🔥 ERROR:", err.message);
        setStatus("error");
      }
    };

    confirmEmail(); // ต้องอยู่นอก function แล้วเรียกหลังปิด {}
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      {status === "loading" && <p>🔄 กำลังยืนยันการลงทะเบียน...</p>}
      {status === "success" && <p style={{ color: "green" }}>✅ ยืนยันเรียบร้อย! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...</p>}
      {status === "invalid" && <p style={{ color: "red" }}>📛 ลิงก์ไม่ถูกต้อง</p>}
      {status === "not_found" && <p style={{ color: "red" }}>❌ ไม่พบบัญชีที่เชิญในระบบ</p>}
      {status === "error" && <p style={{ color: "red" }}>⚠️ เกิดข้อผิดพลาด กรุณาลองใหม่</p>}
    </div>
  );
}

export default ConfirmPage;
