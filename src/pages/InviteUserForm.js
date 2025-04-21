// ✅ InviteUserForm.js (เวอร์ชันพร้อมกรอกอีเมลและส่งคำเชิญ)
import React, { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase"; // ✅ เพิ่มด้านบน

function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
  
    if (!email.includes("@")) {
      setMessage("📛 กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }
  
    setSending(true);
    setMessage("");
  
    try {
      const sendInviteEmail = httpsCallable(functions, "sendInviteEmail");
  
      const result = await sendInviteEmail({
        email,
        name: "", // หากไม่มีช่องกรอกชื่อ สามารถส่งเป็น "" หรือ null ได้
        inviteLink: "https://dashboard-8d8d9.firebaseapp.com/register"
      });
  
      if (result.data.success) {
        setMessage("✅ ส่งคำเชิญเรียบร้อยแล้ว: " + email);
        setEmail("");
      }
    } catch (error) {
      console.error("Invite error:", error);
      setMessage("❌ เกิดข้อผิดพลาดในการส่งคำเชิญ");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20, color: "#002D8B" }}>📩 เชิญผู้ใช้งานใหม่</h2>
      <form onSubmit={handleInvite} style={{ maxWidth: 400 }}>
        <label style={{ display: "block", marginBottom: 8 }}>อีเมลผู้ใช้งาน:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginBottom: 12 }}
          required
        />
        <button
          type="submit"
          disabled={sending}
          style={{
            backgroundColor: sending ? "#ccc" : "#002D8B",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 6,
            cursor: sending ? "not-allowed" : "pointer",
            fontWeight: 500
          }}
        >
          {sending ? "กำลังส่ง..." : "ส่งคำเชิญ"}
        </button>
        {message && <p style={{ marginTop: 12 }}>{message}</p>}
      </form>
    </div>
  );
}

export default InviteUserForm;