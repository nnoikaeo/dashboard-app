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
  const [dashboardLinks, setDashboardLinks] = useState(null);
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
          const userRole = userSnap.data().role || "guest";
          setRole(userRole);

          // ดึง dashboardLinks จาก Firestore
          const configRef = doc(db, "dashboardLinks", "settings");
          const configSnap = await getDoc(configRef);
          if (configSnap.exists()) {
            setDashboardLinks(configSnap.data());
          } else {
            setDashboardLinks({});
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const urls = dashboardLinks?.[role] || [];

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