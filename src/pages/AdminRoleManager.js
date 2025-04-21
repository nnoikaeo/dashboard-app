import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import Dialog from "../components/ui/Dialog";
import Button from "../components/ui/Button";

const firebaseConfig = {
  apiKey: "AIzaSyCZRyxHis9OVIfacCTrgbg_cRbl1afSNiU",
  authDomain: "dashboard-8d8d9.firebaseapp.com",
  projectId: "dashboard-8d8d9",
  storageBucket: "dashboard-8d8d9.firebasestorage.app",
  messagingSenderId: "484283384158",
  appId: "1:484283384158:web:88392f6019d9a6c25dcfcf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function AdminRoleManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingChange, setPendingChange] = useState(null);

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
        setLoading(false);
      } catch (err) {
        setError("ไม่สามารถโหลดรายชื่อผู้ใช้งานได้");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const confirmRoleChange = async () => {
    if (!pendingChange) return;
    const { userId, newRole } = pendingChange;
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error("Error updating role:", err);
      alert("ไม่สามารถอัปเดตบทบาทผู้ใช้ได้");
    } finally {
      setPendingChange(null);
    }
  };

  const handleRoleChange = (userId, newRole, currentRole) => {
    if (newRole === currentRole) return;
    setPendingChange({ userId, newRole });
  };

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>🧑‍💻 รายชื่อผู้ใช้งานและบทบาท</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff" }}>
        <thead style={{ backgroundColor: "#f1f3f5" }}>
          <tr>
            <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #ccc" }}>ชื่อ</th>
            <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #ccc" }}>อีเมล</th>
            <th style={{ padding: 12, textAlign: "left", borderBottom: "1px solid #ccc" }}>บทบาท</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 12 }}>{user.displayName}</td>
              <td style={{ padding: 12 }}>{user.email}</td>
              <td style={{ padding: 12 }}>
                <select
                  value={user.role || "guest"}
                  onChange={(e) => handleRoleChange(user.id, e.target.value, user.role)}
                  style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc" }}
                >
                  <option value="executive">Executive</option>
                  <option value="admin-officer">Administrator Officer</option>
                  <option value="officer">Officer</option>
                  <option value="admin">Administrator</option>
                  <option value="guest">Guest</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={!!pendingChange} onOpenChange={(open) => !open && setPendingChange(null)}>
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center">
          <h3 className="text-lg font-semibold mb-2">ยืนยันการเปลี่ยนบทบาท</h3>
          <p className="mb-4">
            คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนบทบาทเป็น
            <strong> {pendingChange?.newRole}</strong>?
          </p>
          <div className="flex justify-center gap-4" style={{ marginTop: 20 }}>
            <Button onClick={confirmRoleChange}>ยืนยัน</Button>
            <Button variant="outline" onClick={() => setPendingChange(null)}>
              ยกเลิก
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default AdminRoleManager;
