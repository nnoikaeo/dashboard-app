// src/pages/SettingsPage.js
import React, { useEffect, useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Swal from "sweetalert2";

const roles = [
  { key: "executive", label: "ผู้บริหาร" },
  { key: "admin-officer", label: "เจ้าหน้าที่แอดมิน" },
  { key: "officer", label: "พนักงานทั่วไป" },
];

const SettingsPage = () => {
  const [dashboardLinks, setDashboardLinks] = useState({
    executive: ["", "", "", "", ""],
    "admin-officer": ["", "", "", "", ""],
    officer: ["", "", "", "", ""],
  });
  const [loading, setLoading] = useState(true);

  const handleLinkChange = (role, index, value) => {
    setDashboardLinks((prev) => ({
      ...prev,
      [role]: prev[role].map((link, i) => (i === index ? value : link)),
    }));
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "dashboardLinks", "settings"), dashboardLinks);
      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "✅ ลิงก์แดชบอร์ดถูกบันทึกเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("❌ Error saving dashboard links:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "❌ ไม่สามารถบันทึกลิงก์แดชบอร์ดได้",
      });
    }
  };

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const docRef = doc(db, "dashboardLinks", "settings");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDashboardLinks(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
        Swal.fire({
          icon: "error",
          title: "โหลดล้มเหลว",
          text: "ไม่สามารถโหลดลิงก์จากระบบได้",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  if (loading) return <p>⏳ กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <h2 style={{ marginBottom: 20, color: "#002D8B" }}>🔧 ตั้งค่าลิงก์แดชบอร์ด</h2>

      {roles.map((role) => (
        <div key={role.key} style={{ marginBottom: 30 }}>
          <h4 style={{ color: "#002D8B" }}>{role.label}</h4>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#e6ecf5" }}>
                <th style={{ textAlign: "left", padding: 10, color: "#002D8B" }}>ลิงก์</th>
              </tr>
            </thead>
            <tbody>
              {dashboardLinks[role.key].map((link, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 10 }}>
                    <input
                      value={link}
                      onChange={(e) => handleLinkChange(role.key, index, e.target.value)}
                      placeholder={`ลิงก์ที่ ${index + 1}`}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button
          onClick={handleSave}
          style={{
            backgroundColor: "#002D8B",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 500,
            fontSize: 16
          }}
        >
          💾 บันทึกการตั้งค่า
        </button>
      </div>
    </>
  );
};

export default SettingsPage;
