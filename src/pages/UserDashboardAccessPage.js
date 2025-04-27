// src/pages/UserDashboardAccessPage.js
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore();

export default function UserDashboardAccessPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
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
                  <span style={{ color: "#999" }}>ไม่มีแดชบอร์ด
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: 12, textAlign: "left", color: "#002D8B", fontWeight: 600 };
const td = { padding: 12, verticalAlign: "top" };

const formatRole = (role) => {
  switch (role) {
    case "executive": return "ผู้บริหาร";
    case "admin-officer": return "แอดมิน";
    case "officer": return "ปฏิบัติการ";
    case "admin": return "ผู้ดูแลระบบ";
    default: return role || "-";
  }
};
