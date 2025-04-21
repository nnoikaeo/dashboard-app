// DashboardPage.js
import React, { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const [role, setRole] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  const handleFullscreen = () => {
    if (iframeRef.current.requestFullscreen) {
      iframeRef.current.requestFullscreen();
    } else if (iframeRef.current.webkitRequestFullscreen) {
      iframeRef.current.webkitRequestFullscreen();
    } else if (iframeRef.current.mozRequestFullScreen) {
      iframeRef.current.mozRequestFullScreen();
    } else if (iframeRef.current.msRequestFullscreen) {
      iframeRef.current.msRequestFullscreen();
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
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
    <div style={{ padding: 40, backgroundColor: "#f0f4fb", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#ffffff",
          padding: "20px 30px",
          borderRadius: 12,
          marginBottom: 30,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          borderLeft: "6px solid #002D8B"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src="/streamwash-logo.jpg"
            alt="Streamwash Logo"
            style={{ height: 50, borderRadius: 12 }}
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#002D8B" }}>
              แดชบอร์ดสำหรับ: {role}
            </div>
            {user?.displayName && (
              <div style={{ fontSize: 14, color: "#666" }}>👤 {user.displayName}</div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleFullscreen}
            style={{
              backgroundColor: "#002D8B",
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
            }}
          >
            🔎 ขยายเต็มจอ
          </button>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#FF4C4C",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
            }}
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      {urls.length > 0 ? (
        <>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 25, flexWrap: "wrap", gap: 8 }}>
            {urls.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                style={{
                  backgroundColor: activeTab === index ? "#002D8B" : "#ffffff",
                  color: activeTab === index ? "#ffffff" : "#002D8B",
                  border: "2px solid #002D8B",
                  padding: "10px 18px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 14,
                  transition: "all 0.2s ease"
                }}
              >
                แดชบอร์ด #{index + 1}
              </button>
            ))}
          </div>

          <iframe
            ref={iframeRef}
            src={urls[activeTab]}
            width="100%"
            height="800"
            allowFullScreen
            style={{
              border: "none",
              borderRadius: 12,
              boxShadow: "0 3px 18px rgba(0,0,0,0.08)"
            }}
            title={`Looker Studio Dashboard ${activeTab + 1}`}
          />
        </>
      ) : (
        <p style={{ color: "#FF4C4C", textAlign: "center" }}>
          คุณไม่มีสิทธิ์เข้าถึงแดชบอร์ด
        </p>
      )}
    </div>
  );
}

export default DashboardPage;
