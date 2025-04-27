// src/pages/SettingsPage.js
import React, { useEffect, useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Swal from "sweetalert2";

const roles = [
  { key: "executive", label: "ผู้บริหาร" },
  { key: "admin-officer", label: "แอดมิน" },
  { key: "officer", label: "ปฏิบัติการ" },
];

const emptyDashboard = Array(5).fill({ title: "", url: "" });

export default function SettingsPage() {
  const [dashboardLinks, setDashboardLinks] = useState({});
  const [editedDashboardLinks, setEditedDashboardLinks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const docRef = doc(db, "dashboardLinks", "settings");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDashboardLinks(docSnap.data());
          setEditedDashboardLinks(docSnap.data());
        } else {
          const defaultLinks = {};
          roles.forEach((role) => (defaultLinks[role.key] = [...emptyDashboard]));
          setDashboardLinks(defaultLinks);
          setEditedDashboardLinks(defaultLinks);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
        Swal.fire("โหลดล้มเหวบ", "ไม่สามารานลิงก์จากระบบได้", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  const handleAddDashboardLink = (role) => {
    setEditedDashboardLinks((prev) => ({
      ...prev,
      [role]: [...(prev[role] || []), { title: "", url: "" }],
    }));
  };

  const handleDeleteDashboardLink = (role, indexToDelete) => {
    setEditedDashboardLinks((prev) => ({
      ...prev,
      [role]: prev[role].filter((_, i) => i !== indexToDelete),
    }));
  };

  const handleRoleChange = (role, index, field, value) => {
    setEditedDashboardLinks((prev) => ({
      ...prev,
      [role]: prev[role].map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    }));
  };

  const handleSaveDefault = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการบันทึก?",
      text: "คุณต้องการบันทึกการเปลี่ยนแปลงใช่หรือไม่",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, บันทึกเลย!",
      cancelButtonText: "ยกเลิก"
    });

    if (result.isConfirmed) {
      try {
        const normalizedLinks = {};
        for (const role of roles) {
          normalizedLinks[role.key] = editedDashboardLinks[role.key]?.map((link) => ({
            title: typeof link === 'object' ? (link.title || "") : "",
            url: typeof link === 'object' ? (link.url || "") : "",
          })) || Array(5).fill({ title: "", url: "" });
        }

        await setDoc(doc(db, "dashboardLinks", "settings"), normalizedLinks);
        Swal.fire({ icon: "success", title: "👏 บันทึกสำเร็จ", timer: 2000, showConfirmButton: false });
        setDashboardLinks(normalizedLinks);
        setEditedDashboardLinks(normalizedLinks);
      } catch (error) {
        console.error("Error saving:", error);
        Swal.fire("ผิดพลาด", "บันทึกลิงก์ไม่สำเร็จ", "error");
      }
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>⏳ กำลังโหลดข้อมูล...</p>;

  return (
    <div style={{ padding: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h2 style={{ color: "#002D8B", margin: 0 }}>🛠️ ตั้งค่าลิงก์แดชบอร์ด (Role)</h2>
        <button
          onClick={() => setEditedDashboardLinks(dashboardLinks)}
          style={{
            backgroundColor: "#002D8B",
            color: "#fff",
            padding: "6px 16px",
            borderRadius: 6,
            border: "none",
            fontSize: 14,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          รีเซต
        </button>
      </div>

      {roles.map((role) => (
        <div key={role.key} style={{ marginBottom: 40, background: "#f9f9f9", padding: 20, borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ color: "#002D8B", margin: 0 }}>{role.label}</h3>
            <button
              onClick={() => handleAddDashboardLink(role.key)}
              style={{
                backgroundColor: "#002D8B",
                color: "#fff",
                padding: "6px 16px",
                borderRadius: 6,
                border: "none",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              เพิ่ม
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#e6ecf5" }}>
                <th style={{ ...th, width: "5%" }}>#</th>
                <th style={{ ...th, width: "25%" }}>ชื่อแดชบอร์ด</th>
                <th style={{ ...th, width: "65%" }}>URL</th>
                <th style={{ ...th, width: "5%" }}></th>
              </tr>
            </thead>
            <tbody>
              {editedDashboardLinks[role.key]?.map((link, index) => (
                <tr key={index}>
                  <td style={td}>{index + 1}</td>
                  <td style={td}>
                    <input
                      value={link.title}
                      onChange={(e) => handleRoleChange(role.key, index, "title", e.target.value)}
                      style={{ ...input, width: "100%" }}
                    />
                  </td>
                  <td style={td}>
                    <input
                      value={link.url}
                      onChange={(e) => handleRoleChange(role.key, index, "url", e.target.value)}
                      style={{ ...input, width: "100%" }}
                    />
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>
                    <button onClick={() => handleDeleteDashboardLink(role.key, index)} style={{ backgroundColor: "#f9f9f9", color: "#fff", border: "none", padding: "4px 8px", fontSize: 16 }}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <button onClick={handleSaveDefault} style={btnPrimary}>💾 บันทึก</button>
      </div>
    </div>
  );
}

const th = { padding: 10, textAlign: "left", color: "#002D8B" };
const td = { padding: 10 };
const input = { padding: 8, border: "1px solid #ccc", borderRadius: 6, width: "100%" };
const btnPrimary = { backgroundColor: "#002D8B", color: "#fff", padding: "10px 20px", borderRadius: 6, border: "none", fontSize: 16, cursor: "pointer" };
