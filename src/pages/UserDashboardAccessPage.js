// ✅ โค้ด UserDashboardAccessPage.js (เวอร์ชันใหม่ พร้อม Modal แบบ 2 ฝั่งเลือก dashboard)

import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

const db = getFirestore();

const roles = [
  { key: "executive", label: "ผู้บริหาร" },
  { key: "admin-officer", label: "แอดมิน" },
  { key: "officer", label: "ปฏิบัติการ" },
];

export default function UserDashboardAccessPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardTemplates, setDashboardTemplates] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [selectedDashboards, setSelectedDashboards] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const templatesSnapshot = await getDocs(collection(db, "dashboardLinks"));

        const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const templates = templatesSnapshot.docs.find((doc) => doc.id === "settings")?.data() || {};

        setUsers(usersList);
        setDashboardTemplates(templates);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openEditModal = (user) => {
    setEditingUser(user);
    setSelectedDashboards(user.dashboardLinks || []);
  };

  const addDashboard = (dashboard) => {
    if (!selectedDashboards.find((d) => d.title === dashboard.title)) {
      setSelectedDashboards((prev) => [...prev, dashboard]);
    }
  };

  const removeDashboard = (title) => {
    setSelectedDashboards((prev) => prev.filter((d) => d.title !== title));
  };

  const saveChanges = async () => {
    if (!editingUser) return;

    try {
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, { dashboardLinks: selectedDashboards });
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, dashboardLinks: selectedDashboards } : u)));
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user dashboards:", error);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>⏳ กำลังโหลดข้อมูล...</p>;

  return (
    <div style={{ padding: 0 }}>
      <h2 style={{ color: "#002D8B", marginBottom: 30 }}>👥 สิทธิ์การเข้าถึงแดชบอร์ด (User Access)</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#e6ecf5" }}>
          <tr>
            <th style={th}>ชื่อ</th>
            <th style={th}>บริษัท</th>
            <th style={th}>อีเมล</th>
            <th style={th}>บทบาท</th>
            <th style={th}>รายการแดชบอร์ด</th>
            <th style={th}>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={td}>{user.name || "-"}</td>
              <td style={td}>{user.company || "-"}</td>
              <td style={td}>{user.email || "-"}</td>
              <td style={td}>{formatRole(user.role)}</td>
              <td style={td}>
                {Array.isArray(user.dashboardLinks) && user.dashboardLinks.length > 0 ? (
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {user.dashboardLinks.filter((link) => link.title).map((link, idx) => (
                      <li key={idx}>{link.title}</li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ color: "#999" }}>ไม่มีแดชบอร์ด</span>
                )}
              </td>
              <td style={td}>
                <button
                  onClick={() => openEditModal(user)}
                  style={{ backgroundColor: "#002D8B", color: "#fff", padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer" }}
                >
                  แก้ไข
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {editingUser && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>🛠️ แก้ไขสิทธิ์การเข้าถึงแดชบอร์ด</h3>
            <p><b>ชื่อ:</b> {editingUser.name || "-"}</p>
            <p><b>บริษัท:</b> {editingUser.company || "-"}</p>
            <p><b>อีเมล:</b> {editingUser.email || "-"}</p>
            <p><b>บทบาท:</b> {formatRole(editingUser.role)}</p>

            <div style={{ marginTop: 20 }}>
              <b>กำหนดสิทธิ์:</b>
              <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
                {/* Left Side: Groups */}
                <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: 6, padding: 10, maxHeight: 400, overflowY: "auto" }}>
                  {roles.map((role) => (
                    <div key={role.key} style={{ marginBottom: 20 }}>
                      <b>{role.label}</b>
                      <ul style={{ paddingLeft: 20 }}>
                        {(dashboardTemplates[role.key] || []).filter((d) => d.title).map((item, idx) => (
                          <li key={idx} style={{ marginTop: 4, cursor: "pointer" }} onClick={() => addDashboard(item)}>
                            ➡️ {item.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Right Side: Selected Dashboards */}
                <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: 6, padding: 10, maxHeight: 400, overflowY: "auto" }}>
                  <b>แดชบอร์ดที่สามารถเข้าถึงได้</b>
                  <ul style={{ paddingLeft: 20, marginTop: 10 }}>
                    {selectedDashboards.map((item, idx) => (
                      <li key={idx} style={{ marginTop: 4, cursor: "pointer" }} onClick={() => removeDashboard(item.title)}>
                        ⬅️ {item.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setEditingUser(null)} style={buttonCancel}>ยกเลิก</button>
              <button onClick={saveChanges} style={buttonSave}>💾 บันทึกการเปลี่ยนแปลง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: 12, textAlign: "left", color: "#002D8B", fontWeight: 600 };
const td = { padding: 12, verticalAlign: "top" };
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 };
const modalContent = { backgroundColor: "#fff", padding: 30, borderRadius: 10, width: 700, maxHeight: "90vh", overflowY: "auto" };
const buttonCancel = { backgroundColor: "#ccc", padding: "10px 20px", border: "none", borderRadius: 6, cursor: "pointer" };
const buttonSave = { backgroundColor: "#002D8B", color: "#fff", padding: "10px 20px", border: "none", borderRadius: 6, cursor: "pointer" };

const formatRole = (role) => {
  switch (role) {
    case "executive": return "ผู้บริหาร";
    case "admin-officer": return "แอดมิน";
    case "officer": return "ปฏิบัติการ";
    case "admin": return "ผู้ดูแลระบบ";
    default: return role || "-";
  }
};
