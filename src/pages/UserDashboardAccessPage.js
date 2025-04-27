// src/pages/UserDashboardAccessPage.js
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const db = getFirestore();

export default function UserDashboardAccessPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [dashboardOptions, setDashboardOptions] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCol = collection(db, "users");
        const usersSnapshot = await getDocs(usersCol);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const openEditModal = async (user) => {
    setEditingUser(user);
    setSelectedRole(user.role || "");
    await loadDashboardsByRole(user.role);
  };

  const loadDashboardsByRole = async (role) => {
    if (!role) return;
    try {
      const docRef = doc(db, "dashboardLinks", "settings");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDashboardOptions(data[role] || []);
      }
    } catch (error) {
      console.error("Error loading dashboards by role:", error);
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    loadDashboardsByRole(newRole);
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
                    {user.dashboardLinks.filter(link => link.title).map((link, idx) => (
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
                  style={editButtonStyle}
                >
                  แก้ไข
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>🛠️ แก้ไขสิทธิ์การเข้าถึงแดชบอร์ด</h3>
            <p><b>ชื่อ:</b> {editingUser.name || "-"}</p>
            <p><b>อีเมล:</b> {editingUser.email || "-"}</p>

            <label style={{ marginTop: 10 }}>บทบาท:</label>
            <select value={selectedRole} onChange={handleRoleChange} style={inputStyle}>
              <option value="">-- เลือกบทบาท --</option>
              <option value="executive">ผู้บริหาร</option>
              <option value="admin-officer">แอดมิน</option>
              <option value="officer">ปฏิบัติการ</option>
              <option value="admin">ผู้ดูแลระบบ</option>
            </select>

            <div style={{ marginTop: 20 }}>
              <b>รายการแดชบอร์ด:</b>
              {dashboardOptions.length > 0 ? (
                <ul>
                  {dashboardOptions.filter(link => link.title).map((link, idx) => (
                    <li key={idx}>{link.title}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#999" }}>ไม่มีแดชบอร์ด</p>
              )}
            </div>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setEditingUser(null)} style={buttonCancel}>ยกเลิก</button>
              {/* <button style={buttonSave}>💾 บันทึกการเปลี่ยนแปลง</button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: 12, textAlign: "left", color: "#002D8B", fontWeight: 600 };
const td = { padding: 12, verticalAlign: "top" };
const editButtonStyle = {
  backgroundColor: "#002D8B",
  color: "#fff",
  padding: "8px 16px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
};
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 };
const modalContent = { backgroundColor: "#fff", padding: 30, borderRadius: 10, width: 400 };
const inputStyle = { width: "100%", padding: 10, marginTop: 6, borderRadius: 6, border: "1px solid #ccc" };
const buttonCancel = { backgroundColor: "#ccc", padding: "8px 16px", border: "none", borderRadius: 6, cursor: "pointer" };
// const buttonSave = { backgroundColor: "#28a745", color: "#fff", padding: "8px 16px", border: "none", borderRadius: 6, cursor: "pointer" };

const formatRole = (role) => {
  switch (role) {
    case "executive": return "ผู้บริหาร";
    case "admin-officer": return "แอดมิน";
    case "officer": return "ปฏิบัติการ";
    case "admin": return "ผู้ดูแลระบบ";
    default: return role || "-";
  }
};
