// ✅ ไฟล์ใหม่: AdminPage.js (เฉพาะเมนูหลัก)
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import AdminLogsPage from "./AdminLogsPage";
import AdminRoleManager from "./AdminRoleManager";
import InviteUserForm from "./InviteUserForm";

function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("logs");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <div style={{ padding: 40, backgroundColor: "#f7f9fc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
        backgroundColor: "#fff",
        padding: "20px 30px",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        borderLeft: "6px solid #002D8B"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src="/streamwash-logo.jpg"
            alt="Streamwash Logo"
            style={{ height: 50, borderRadius: 12 }}
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#002D8B" }}>แผงควบคุมผู้ดูแลระบบ</div>
            {auth.currentUser?.displayName && (
              <div style={{ fontSize: 14, color: "#666" }}>👤 {auth.currentUser?.displayName}</div>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          ออกจากระบบ
        </button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab("logs")}
          style={tabButtonStyle(activeTab === "logs")}
        >
          ประวัติการเข้าใช้งาน
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          style={tabButtonStyle(activeTab === "roles")}
        >
          จัดการบทบาทผู้ใช้
        </button>
        <button
          onClick={() => setActiveTab("invite")}
          style={tabButtonStyle(activeTab === "invite")}
        >
          เชิญผู้ใช้งาน
        </button>
      </div>

      {/* Content */}
      <div style={{ backgroundColor: "#fff", padding: 30, borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        {activeTab === "logs" && <AdminLogsPage />}
        {activeTab === "roles" && <AdminRoleManager />}
        {activeTab === "invite" && <InviteUserForm />}
      </div>
    </div>
  );
}

const tabButtonStyle = (active) => ({
  marginRight: 10,
  padding: "10px 16px",
  borderRadius: 8,
  backgroundColor: active ? "#002D8B" : "#fff",
  color: active ? "#fff" : "#002D8B",
  border: "2px solid #002D8B",
  fontWeight: 500,
  cursor: "pointer"
});

export default AdminPage;
