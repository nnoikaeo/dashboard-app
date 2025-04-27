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
  // const [customUserEmail, setCustomUserEmail] = useState("");
  // const [customUserLinks, setCustomUserLinks] = useState([...emptyDashboard]);
  // const [useDefaultLinks, setUseDefaultLinks] = useState(true);
  const [loading, setLoading] = useState(true);
  // const [emailSearch, setEmailSearch] = useState("");

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const docRef = doc(db, "dashboardLinks", "settings");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDashboardLinks(docSnap.data());
        } else {
          const defaultLinks = {};
          roles.forEach((role) => (defaultLinks[role.key] = [...emptyDashboard]));
          setDashboardLinks(defaultLinks);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
        Swal.fire("โหลดล้มเหลว", "ไม่สามารถานลิงก์จากระบบได้", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  const handleRoleChange = (role, index, field, value) => {
    setDashboardLinks((prev) => ({
      ...prev,
      [role]: prev[role].map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    }));
  };

  const handleSaveDefault = async () => {
    try {
      // 🛠 ก่อนบันทึก ต้อง normalize ข้อมูลก่อน
      const normalizedLinks = {};
      for (const role of roles) {
        normalizedLinks[role.key] = dashboardLinks[role.key]?.map((link) => ({
          title: typeof link === 'object' ? (link.title || "") : "",
          url: typeof link === 'object' ? (link.url || "") : "",
        })) || Array(5).fill({ title: "", url: "" });
      }
  
      await setDoc(doc(db, "dashboardLinks", "settings"), normalizedLinks);
      Swal.fire({ icon: "success", title: "👏 บันทึกสำเร็จ", timer: 2000, showConfirmButton: false });
    } catch (error) {
      console.error("Error saving:", error);
      Swal.fire("ผิดพลาด", "บันทึกลิงก์ไม่สำเร็จ", "error");
    }
  };  

  // const handleSaveCustomUser = async () => {
  //   if (!customUserEmail) {
  //     Swal.fire("ระบบอีเมลไม่ถูกต้อง", "warning");
  //     return;
  //   }
  //   try {
  //     const userRef = doc(db, "users", customUserEmail);
  //     if (useDefaultLinks) {
  //       await setDoc(userRef, { dashboardLinks: null }, { merge: true });
  //     } else {
  //       await setDoc(userRef, { dashboardLinks: customUserLinks }, { merge: true });
  //     }
  //     Swal.fire({ icon: "success", title: "👏 ตั้งค่าเรียบร้อยแล้ว", timer: 2000, showConfirmButton: false });
  //     setCustomUserEmail("");
  //     setCustomUserLinks([...emptyDashboard]);
  //     setUseDefaultLinks(true);
  //   } catch (error) {
  //     console.error("Error saving:", error);
  //     Swal.fire("ผิดพลาด", "บันทึกลิงก์ไม่สำเร็จ", "error");
  //   }
  // };

  if (loading) return <p style={{ textAlign: "center" }}>⏳ กำลังโหลดข้อมูล...</p>;

  return (
    <div style={{ padding: 0 }}>
      <h2 style={{ marginBottom: 30, color: "#002D8B" }}>🛠️ ตั้งค่าลิงก์แดชบอร์ด (Role)</h2>

      {roles.map((role) => (
        <div key={role.key} style={{ marginBottom: 40, background: "#f9f9f9", padding: 20, borderRadius: 10 }}>
          <h3 style={{ color: "#002D8B", marginTop: 0, marginBottom: 10 }}>{role.label}</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#e6ecf5" }}>
                <th style={{ ...th, width: "5%" }}>#</th>
                <th style={{ ...th, width: "35%" }}>ชื่อแดชบอร์ด</th>
                <th style={{ ...th, width: "60%" }}>URL</th>
              </tr>
            </thead>
            <tbody>
              {dashboardLinks[role.key]?.map((link, index) => (
                <tr key={index}>
                  <td style={{ ...td, width: "5%" }}>{index + 1}</td>
                  <td style={{ ...td, width: "35%" }}>
                    <input
                      value={link.title}
                      onChange={(e) => handleRoleChange(role.key, index, "title", e.target.value)}
                      style={{ ...input, width: "100%" }}
                    />
                  </td>
                  <td style={{ ...td, width: "60%" }}>
                    <input
                      value={link.url}
                      onChange={(e) => handleRoleChange(role.key, index, "url", e.target.value)}
                      style={{ ...input, width: "100%" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <button onClick={handleSaveDefault} style={btnPrimary}>💾 บันทึก Default</button>
      </div>

      {/* <h2 style={{ marginBottom: 20, color: "#002D8B" }}>🧑‍💻 ตั้งค่าลิงก์เฉพาะบุคคล</h2>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="ค้นหาอีเมลผู้ใช้งาน..."
          value={emailSearch}
          onChange={(e) => setEmailSearch(e.target.value)}
          style={{ ...input, width: 400 }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="email"
          placeholder="กรอกอีเมลผู้ใช้งาน"
          value={customUserEmail}
          onChange={(e) => setCustomUserEmail(e.target.value)}
          style={{ ...input, width: 400 }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label><input type="radio" checked={useDefaultLinks} onChange={() => setUseDefaultLinks(true)} /> ใช้ Default</label>
        <label style={{ marginLeft: 20 }}><input type="radio" checked={!useDefaultLinks} onChange={() => setUseDefaultLinks(false)} /> กำหนดเอง</label>
      </div>

      {!useDefaultLinks && (
        <div>
          {customUserLinks.map((link, index) => (
            <div key={index} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input
                value={link.title}
                onChange={(e) => setCustomUserLinks((prev) => prev.map((l, i) => (i === index ? { ...l, title: e.target.value } : l)))}
                placeholder={`ชื่อแดชบอร์ด #${index + 1}`}
                style={{ ...input, flex: 1 }}
              />
              <input
                value={link.url}
                onChange={(e) => setCustomUserLinks((prev) => prev.map((l, i) => (i === index ? { ...l, url: e.target.value } : l)))}
                placeholder={`URL #${index + 1}`}
                style={{ ...input, flex: 2 }}
              />
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 30 }}>
        <button onClick={handleSaveCustomUser} style={btnPrimary}>📂 บันทึกลิงก์เฉพาะบุคคล</button>
      </div> */}
    </div>
  );
}

const th = { padding: 10, textAlign: "left", color: "#002D8B" };
const td = { padding: 10 };
const input = { padding: 8, border: "1px solid #ccc", borderRadius: 6, width: "100%" };
const btnPrimary = { backgroundColor: "#002D8B", color: "#fff", padding: "10px 20px", borderRadius: 6, border: "none", fontSize: 16, cursor: "pointer" };
// const btnSuccess = { backgroundColor: "#28a745", color: "#fff", padding: "10px 20px", borderRadius: 6, border: "none", fontSize: 16, cursor: "pointer" };
