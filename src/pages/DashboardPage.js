// DashboardPage.js
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setRole(userSnap.data().role || "guest");
        } else {
          setRole("guest");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getDashboardUrlsByRole = (role) => {
    const dashboards = {
      executive: [
        "https://lookerstudio.google.com/embed/reporting/d95a3df9-e38b-4002-b5b4-89ba8585a5e3/page/p_90bk1iqchd",
        "https://example.com/executive/2",
        "https://example.com/executive/3",
        "https://example.com/executive/4",
        "https://example.com/executive/5"
      ],
      "admin-officer": [
        "https://lookerstudio.google.com/embed/reporting/36b29895-7d9a-4099-965a-2165ac81d874/page/hdyGF",
        "https://example.com/admin/2",
        "https://example.com/admin/3",
        "https://example.com/admin/4",
        "https://example.com/admin/5"
      ],
      officer: [
        "https://lookerstudio.google.com/embed/reporting/458ef5af-1040-47e8-8d85-5731f8d12213/page/O6ouE",
        "https://example.com/officer/2",
        "https://example.com/officer/3",
        "https://example.com/officer/4",
        "https://example.com/officer/5"
      ],
    };
    return dashboards[role] || [];
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>กำลังโหลดแดชบอร์ด...</p>;
  }

  const urls = getDashboardUrlsByRole(role);

  return (
    <div style={{ padding: 40, backgroundColor: "#f5f8fb", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: "20px 30px",
          borderRadius: 12,
          marginBottom: 30,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22 }}>
          📊 ทดสอบ แดชบอร์ดสำหรับ: <span style={{ textTransform: "capitalize" }}>{role}</span>
        </h2>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ออกจากระบบ
        </button>
      </div>

      {urls.length > 0 ? (
        <>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, flexWrap: "wrap", gap: 6 }}>
            {urls.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                style={{
                  backgroundColor: activeTab === index ? "#007bff" : "#fff",
                  color: activeTab === index ? "#fff" : "#007bff",
                  border: "1px solid #007bff",
                  padding: "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 500,
                  minWidth: 100,
                }}
              >
                แดชบอร์ด #{index + 1}
              </button>
            ))}
          </div>

          <iframe
            src={urls[activeTab]}
            width="100%"
            height="800"
            style={{
              border: "1px solid #ccc",
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
            title={`Looker Studio Dashboard ${activeTab + 1}`}
          />
        </>
      ) : (
        <p style={{ color: "red", textAlign: "center" }}>
          คุณไม่มีสิทธิ์เข้าถึงแดชบอร์ด
        </p>
      )}
    </div>
  );
}

export default DashboardPage;
