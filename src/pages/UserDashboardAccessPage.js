import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDoc } from "firebase/firestore"; // เพิ่มตัวนี้

const db = getFirestore();
const auth = getAuth();

const roles = [
  { key: "executive", label: "ผู้บริหาร" },
  { key: "admin-officer", label: "แอดมิน" },
  { key: "officer", label: "ปฏิบัติการ" },
];

export default function UserDashboardAccessPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedDashboards, setSelectedDashboards] = useState([]);
  const [dashboardTemplates, setDashboardTemplates] = useState({});

useEffect(() => {
  const fetchData = async () => {
    try {
      const tokenResult = await auth.currentUser.getIdTokenResult(true);
      console.log("🔐 Current User Role:", tokenResult.claims.role);

      if (tokenResult.claims.role === "admin") {
        const q = query(collection(db, "users"), where("role", "!=", ""));
        const snapshot = await getDocs(q);
        const userList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("📥 Users fetched:", userList);
        setUsers(userList);

        // ✅ โหลด settings document แบบถูกต้อง
        const settingsRef = doc(db, "dashboardLinks", "settings");
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
          const raw = settingsDoc.data();
          const templates = {};
          roles.forEach((r) => {
            templates[r.key] = raw[r.key] || [];
            console.log(`📂 ${r.key}:`, templates[r.key]);
          });
          setDashboardTemplates(templates);
        } else {
          console.warn("⚠️ dashboardLinks/settings not found");
        }
      } else {
        console.warn("⛔️ User is not admin, skipping data load");
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
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
      console.log("💾 Saving changes for:", editingUser.email);
      console.log("📤 Dashboards to save:", selectedDashboards);
  
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, { dashboardLinks: selectedDashboards });
  
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, dashboardLinks: selectedDashboards } : u))
      );
      setEditingUser(null);
    } catch (error) {
      console.error("❌ Error saving:", error);
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
            <th style={th}>จัดการ</th>
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
                <button onClick={() => openEditModal(user)} style={editButton}>✏️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal แบบ 2 ฝั่ง */}
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
                {/* ซ้าย: Templates */}
                <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: 6, padding: 10 }}>
                  {roles.map((role) => (
                    <div key={role.key} style={{ marginBottom: 20 }}>
                      <b>{role.label}</b>
                      <ul style={{ paddingLeft: 0, listStyleType: "none", marginTop: 4 }}>
                        {(() => {
                          const list = dashboardTemplates[role.key] || [];
                          console.log(`🖼️ Rendering dashboardTemplates for ${role.key}:`, list);
                          return list.length === 0 ? (
                            <li style={{ color: "#999" }}>ไม่มีแดชบอร์ด</li>
                          ) : (
                            list.filter((d) => d.title).map((item, idx) => (
                              <li key={idx} style={{ marginTop: 4, cursor: "pointer" }} onClick={() => addDashboard(item)}>
                                ➡️ {item.title}
                              </li>
                            ))
                          );
                        })()}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* ขวา: Selected */}
                <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: 6, padding: 10 }}>
                  <b>แดชบอร์ดที่สามารถเข้าถึงได้</b>
                  <ul style={{ paddingLeft: 0, marginTop: 10, listStyleType: "none" }}>
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
              <button onClick={saveChanges} style={buttonSave}>💾 บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: 12, textAlign: "left", color: "#002D8B", fontWeight: 600 };
const td = { padding: 12, verticalAlign: "top" };
const editButton = { backgroundColor: "#fff", color: "#555", padding: "6px 14px", border: "none", fontSize: 16 };
const buttonCancel = { backgroundColor: "#ccc", padding: "10px 20px", border: "none", borderRadius: 6, cursor: "pointer" };
const buttonSave = { backgroundColor: "#002D8B", color: "#fff", padding: "10px 20px", border: "none", borderRadius: 6, cursor: "pointer" };
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 };
const modalContent = { backgroundColor: "#fff", padding: 30, borderRadius: 10, width: 700, maxHeight: "90vh", overflowY: "auto" };

const formatRole = (role) => {
  switch (role) {
    case "executive": return "ผู้บริหาร";
    case "admin-officer": return "แอดมิน";
    case "officer": return "ปฏิบัติการ";
    case "admin": return "ผู้ดูแลระบบ";
    default: return role || "-";
  }
};