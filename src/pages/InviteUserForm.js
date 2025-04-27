import React, { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function InviteUserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("officer");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!email.includes("@") || name.trim() === "") {
      setMessage("📛 กรุณากรอกชื่อและอีเมลให้ถูกต้อง");
      return;
    }

    setSending(true);
    setMessage("");

    const inviteLink = `https://dashboard-8d8d9.web.app/confirm?email=${encodeURIComponent(email)}`;

    try {
      await setDoc(doc(db, "invites", email), {
        name,
        email,
        role,
        status: "pending",
        invitedAt: serverTimestamp(),
        confirmedAt: null
      });

      const response = await fetch("https://us-central1-dashboard-8d8d9.cloudfunctions.net/sendInviteEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, name, role, inviteLink })
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ ส่งคำเชิญเรียบร้อยแล้ว: ${email}`);
        setName("");
        setEmail("");
        setRole("officer");
      } else {
        setMessage("❌ เกิดข้อผิดพลาดในการส่งคำเชิญ");
      }
    } catch (error) {
      console.error("Invite error:", error);
      setMessage("❌ เกิดข้อผิดพลาดในการส่งคำเชิญ");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", backgroundColor: "#fff", padding: 30, borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <h2 style={{ marginBottom: 20, color: "#002D8B" }}>📩 เชิญผู้ใช้งาน</h2>

      <form onSubmit={handleInvite}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#333" }}>ชื่อผู้ใช้งาน:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ชื่อ-นามสกุล"
            required
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 14
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#333" }}>อีเมลผู้ใช้งาน:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 14
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 6, color: "#333" }}>สิทธิ์การใช้งาน:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 14
            }}
          >
            <option value="executive">ผู้บริหาร</option>
            <option value="admin-officer">แอดมิน</option>
            <option value="officer">ปฏิบัติการ</option>
            <option value="admin">ผู้ดูแลระบบ</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={sending}
          style={{
            backgroundColor: sending ? "#ccc" : "#002D8B",
            color: "#fff",
            padding: "12px 24px",
            border: "none",
            borderRadius: 8,
            cursor: sending ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: 16
          }}
        >
          {sending ? "กำลังส่ง..." : "ส่งคำเชิญ"}
        </button>

        {message && (
          <p style={{ marginTop: 20, color: message.includes("✅") ? "green" : "red", fontWeight: 500 }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default InviteUserForm;
