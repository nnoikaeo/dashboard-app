// ✅ AdminRoleManager (with Edit & Invite Modals)
import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,  
  deleteDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import Swal from "sweetalert2";

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

const companies = ["STSS", "STSB", "STEB", "OAYT", "INFE", "OPCB", "INHH", "STCM", "OCRI", "STPL", "STNR", "STUD", "STKK", "STUB", "STPT", "STCN", "STRY", "STPK", "STHY", "STKB", "STSM", "STCS", "STTN", "STTH"];
const roles = ["executive", "admin-officer", "officer", "admin"];
const statuses = ["active", "inactive", "suspended"];

function AdminRoleManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState({ name: "", email: "", role: "officer" });
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCol = collection(db, "users");
        const usersSnapshot = await getDocs(usersCol);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
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

  const handleDeleteUser = async (userId, email) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: `คุณต้องการลบผู้ใช้งาน ${email} หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่ ลบเลย!",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#999"
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "users", userId));
        // await deleteDoc(doc(db, "invites", email));
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
        Swal.fire("ลบแล้ว!", "ผู้ใช้งานถูกลบออกจากระบบแล้ว", "success");
      } catch (err) {
        console.error("Error deleting user:", err);
        Swal.fire("ผิดพลาด", "ไม่สามารถลบผู้ใช้งานได้", "error");
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      const ref = doc(db, "users", editingUser.id);
      await updateDoc(ref, {
        name: editingUser.name ?? "",
        company: editingUser.company ?? "",
        role: editingUser.role ?? "",
        status: editingUser.status ?? ""
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...editingUser } : u))
      );
      setEditingUser(null);
      Swal.fire("สำเร็จ", "อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว", "success");
    } catch (error) {
      console.error("Save edit error:", error);
      Swal.fire("ผิดพลาด", "ไม่สามารถบันทึกการแก้ไขได้", "error");
    }
  };

  const handleSendInvite = async () => {
    const { name, company, email, role } = inviteData;
    if (!email.includes("@") || name.trim() === "") {
      setInviteMessage("📛 กรุณากรอกชื่อและอีเมลให้ถูกต้อง");
      return;
    }
    setSendingInvite(true);
    const inviteLink = `https://dashboard-8d8d9.web.app/confirm?email=${encodeURIComponent(email)}`;
    try {
      await setDoc(doc(db, "invites", email), {
        name,
        company, 
        email,
        role,
        invitedAt: serverTimestamp(),
        confirmedAt: null
      });
      await setDoc(doc(db, "users", email), {
        name,
        company, 
        email,
        role,
        status: "inactive"
      });
      const response = await fetch("https://us-central1-dashboard-8d8d9.cloudfunctions.net/sendInviteEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, companies, role, inviteLink })
      });
      const result = await response.json();
      if (result.success) {
        setInviteMessage(`✅ ส่งคำเชิญเรียบร้อยแล้ว: ${email}`);
        setInviteData({ name: "", email: "", role: "officer" });
        setShowInvite(false);
      } else {
        setInviteMessage("❌ เกิดข้อผิดพลาดในการส่งคำเชิญ");
      }
    } catch (err) {
      console.error("Invite error:", err);
      setInviteMessage("❌ เกิดข้อผิดพลาดในการส่งคำเชิญ");
    } finally {
      setSendingInvite(false);
    }
  };

  const getStatusLabel = (status) => {
    if (status === statuses[0]) return <span style={{ color: "green" }}>● Active</span>;
    if (status === statuses[1]) return <span style={{ color: "orange" }}>● Inactive</span>;
    if (status === statuses[2]) return <span style={{ color: "red" }}>● Suspended</span>;
    return <span style={{ color: "#999" }}>–</span>;
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "executive": return "ผู้บริหาร";
      case "admin-officer": return "แอดมิน";
      case "officer": return "ปฏิบัติการ";
      case "admin": return "ผู้ดูแลระบบ";
      default: return "-";
    }
  };

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#002D8B" }}>📋 รายชื่อผู้ใช้งาน</h2>
        <button
          onClick={() => setShowInvite(true)}
          style={{ backgroundColor: "#002D8B", color: "white", padding: "8px 16px", border: "none", borderRadius: 6, cursor: "pointer" }}
        >
          เพิ่มผู้ใช้งาน
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff" }}>
        <thead style={{ backgroundColor: "#e6ecf5" }}>
          <tr>
            <th style={th}>#</th>
            <th style={th}>ชื่อ</th>
            <th style={th}>บริษัท</th>
            <th style={th}>อีเมล</th>
            <th style={th}>บทบาท</th>
            <th style={th}>สถานะ</th>
            <th style={th}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={td}>{index + 1}</td>
              <td style={td}>{user.name}</td>
              <td style={td}>{user.company}</td>
              <td style={td}>{user.email}</td>
              <td style={td}>{getRoleLabel(user.role)}</td>
              <td style={td}>{getStatusLabel(user.status)}</td>
              <td style={{ ...td, gap: 8 }}>
                <button onClick={() => setEditingUser(user)} style={{ backgroundColor: "#fff", color: "#fff", border: "none", fontSize: 16 }}>✏️</button>
                <button onClick={() => handleDeleteUser(user.id, user.email)} style={{ backgroundColor: "#fff", color: "#fff", border: "none", fontSize: 16 }}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Invite Modal */}
      {showInvite && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>📩 เชิญผู้ใช้งาน</h3>
            <label>ชื่อผู้ใช้งาน:</label>
            <input type="text" value={inviteData.name} onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })} style={inputStyle} />
            <label>บริษัท:</label>
            <select value={inviteData.company} onChange={(e) => setInviteData({ ...inviteData, company: e.target.value })} style={inputStyle}>
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label>อีเมลผู้ใช้งาน:</label>
            <input type="email" value={inviteData.email} onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })} style={inputStyle} />
            <label>สิทธิ์การใช้งาน:</label>
            <select value={inviteData.role} onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })} style={inputStyle}>
              {roles.map((r) => (
                <option key={r} value={r}>{getRoleLabel(r)}</option>
              ))}
            </select>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowInvite(false)} style={buttonCancel}>ยกเลิก</button>
              <button onClick={handleSendInvite} disabled={sendingInvite} style={buttonSave}>📨 ส่งคำเชิญ</button>
            </div>
            {inviteMessage && <p style={{ marginTop: 10, color: inviteMessage.includes("✅") ? "green" : "red" }}>{inviteMessage}</p>}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>📝 แก้ไขข้อมูลผู้ใช้งาน</h3>
            <label>ชื่อ:</label>
            <input value={editingUser.name || ""} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} style={inputStyle} />
            <label>บริษัท:</label>
            <select value={editingUser.company || ""} onChange={(e) => setEditingUser({ ...editingUser, company: e.target.value })} style={inputStyle}>
              {companies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label>บทบาท:</label>
            <select value={editingUser.role || ""} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} style={inputStyle}>
              {roles.map((r) => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
            </select>
            <label>สถานะ:</label>
            <select value={editingUser.status || ""} onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })} style={inputStyle}>
              <option value={statuses[0]}>✅ Active</option>
              <option value={statuses[1]}>⚠️ Inactive</option>
              <option value={statuses[2]}>❌ Suspended</option>
            </select>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button onClick={() => setEditingUser(null)} style={buttonCancel}>ยกเลิก</button>
              <button onClick={handleSaveEdit} style={buttonSave}>💾 บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: 12, textAlign: "left", color: "#002D8B" };
const td = { padding: 12 };
const inputStyle = { width: "100%", padding: 10, marginBottom: 12, borderRadius: 6, border: "1px solid #ccc" };
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 };
const modalContent = { backgroundColor: "#fff", padding: 30, borderRadius: 10, width: 400 };
const buttonCancel = { backgroundColor: "#ccc", padding: "8px 16px", border: "none", borderRadius: 6, cursor: "pointer" };
const buttonSave = { backgroundColor: "#002D8B", color: "white", padding: "8px 16px", border: "none", borderRadius: 6, cursor: "pointer" };

export default AdminRoleManager;
