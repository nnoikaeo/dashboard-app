// src/components/InviteUserButton.jsx
import React from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

const InviteUserButton = () => {
  const handleSendInvite = async () => {
    const sendInviteEmail = httpsCallable(functions, "sendInviteEmail");

    try {
      const result = await sendInviteEmail({
        email: "example@email.com",
        name: "คุณสมชาย",
        inviteLink: "https://dashboard-8d8d9.firebaseapp.com/register"
      });

      if (result.data.success) {
        alert("✅ ส่งอีเมลเชิญสำเร็จแล้ว!");
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      alert("เกิดข้อผิดพลาดในการส่งอีเมล");
    }
  };

  return <button onClick={handleSendInvite}>📩 ส่งอีเมลเชิญ</button>;
};

export default InviteUserButton;
