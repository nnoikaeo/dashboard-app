// AdminPage.js
import React, { useState, useEffect, useCallback } from "react";
import AdminRoleManager from "../AdminRoleManager";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  limit,
  startAfter,
  getCountFromServer,
} from "firebase/firestore";
import { format } from "date-fns";

const db = getFirestore();

function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("logs");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisibleDocs, setLastVisibleDocs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const fetchLogs = useCallback(
    async (page = 0) => {
      setLoading(true);
      try {
        const baseRef = collection(db, "loginLogs");

        if (page === 0) {
          const countSnap = await getCountFromServer(baseRef);
          setTotalCount(countSnap.data().count);
        }

        const constraints = [
          orderBy("timestamp", "desc"),
          orderBy("__name__")
        ];

        if (page > 0 && lastVisibleDocs[page - 1]) {
          constraints.push(startAfter(lastVisibleDocs[page - 1]));
        }

        constraints.push(limit(pageSize));
        const q = query(baseRef, ...constraints);
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];

        setLogs(data);
        if (lastVisibleDocs.length <= page) {
          setLastVisibleDocs((prev) => [...prev, lastDoc]);
        }

        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    },
    [lastVisibleDocs, pageSize]
  );

  useEffect(() => {
    fetchLogs(0);
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) =>
    log.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: 40, backgroundColor: "#f7f9fc", minHeight: "100vh" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
        backgroundColor: "#fff",
        padding: "20px 30px",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/streamwash-logo.jpg"
            alt="Streamwash Logo"
            style={{ height: 40, marginRight: 15, borderRadius: 8, boxShadow: "0 0 4px rgba(0,0,0,0.1)" }}
          />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: "#002D8B" }}>แผงควบคุมผู้ดูแลระบบ</h1>
            <p style={{ fontSize: 14, margin: 0, color: "#555" }}>👤 {auth.currentUser?.displayName}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          ออกจากระบบ
        </button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab("logs")}
          style={{
            marginRight: 10,
            padding: "10px 16px",
            borderRadius: 8,
            backgroundColor: activeTab === "logs" ? "#002D8B" : "#fff",
            color: activeTab === "logs" ? "#fff" : "#002D8B",
            border: "2px solid #002D8B",
            fontWeight: 500,
            cursor: "pointer"
          }}
        >
          ประวัติการเข้าใช้งาน
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            backgroundColor: activeTab === "roles" ? "#002D8B" : "#fff",
            color: activeTab === "roles" ? "#fff" : "#002D8B",
            border: "2px solid #002D8B",
            fontWeight: 500,
            cursor: "pointer"
          }}
        >
          จัดการบทบาทผู้ใช้
        </button>
      </div>

      {/* Content Box */}
      <div style={{ backgroundColor: "#fff", padding: 30, borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        {activeTab === "roles" && <AdminRoleManager />}

        {activeTab === "logs" && (
          <>
            <h2 style={{ marginBottom: 20, color: "#002D8B" }}>📜 ประวัติการเข้าใช้งานระบบ</h2>

            <div style={{ marginBottom: 20 }}>
              <label style={{ marginRight: 10 }}>แสดงรายการต่อหน้า:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setLastVisibleDocs([]);
                  setPageSize(Number(e.target.value));
                  fetchLogs(0);
                }}
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ marginRight: 10 }}>ค้นหาด้วยชื่อหรืออีเมล:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="พิมพ์ชื่อหรืออีเมล..."
                style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", width: 300 }}
              />
            </div>

            {loading && logs.length === 0 ? (
              <p>กำลังโหลดข้อมูล...</p>
            ) : (
              <>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "#e6ecf5" }}>
                    <tr>
                      <th style={{ padding: 10, textAlign: "left", color: "#002D8B" }}>ชื่อ</th>
                      <th style={{ padding: 10, textAlign: "left", color: "#002D8B" }}>อีเมล</th>
                      <th style={{ padding: 10, textAlign: "left", color: "#002D8B" }}>เวลาเข้าใช้งาน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: 10 }}>{log.displayName}</td>
                        <td style={{ padding: 10 }}>{log.email}</td>
                        <td style={{ padding: 10 }}>
                          {log.timestamp?.toDate ? format(log.timestamp.toDate(), "dd/MM/yyyy HH:mm:ss") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div style={{ textAlign: "center", marginTop: 30 }}>
                  <button
                    onClick={() => fetchLogs(0)}
                    disabled={currentPage === 0}
                    style={{
                      marginRight: 10,
                      padding: "8px 14px",
                      borderRadius: 6,
                      cursor: currentPage === 0 ? "not-allowed" : "pointer",
                      backgroundColor: currentPage === 0 ? "#ccc" : "#002D8B",
                      color: "#fff",
                      border: "none"
                    }}
                  >
                    หน้าแรก
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => fetchLogs(i)}
                      style={{
                        marginRight: 6,
                        backgroundColor: currentPage === i ? "#002D8B" : "#fff",
                        color: currentPage === i ? "#fff" : "#002D8B",
                        border: "1px solid #002D8B",
                        padding: "8px 14px",
                        borderRadius: 6,
                        cursor: "pointer"
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => fetchLogs(totalPages - 1)}
                    disabled={currentPage === totalPages - 1}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 6,
                      cursor: currentPage === totalPages - 1 ? "not-allowed" : "pointer",
                      backgroundColor: currentPage === totalPages - 1 ? "#ccc" : "#002D8B",
                      color: "#fff",
                      border: "none"
                    }}
                  >
                    หน้าสุดท้าย
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
