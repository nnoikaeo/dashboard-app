// ✅ AdminLogsPage.js (ฉบับสมบูรณ์ พร้อมโหลดข้อมูลและกรองผลลัพธ์)
import React, { useState, useEffect, useCallback } from "react";
import { getFirestore, collection, getDocs, orderBy, query } from "firebase/firestore";
import { format } from "date-fns";

const db = getFirestore();

function AdminLogsPage() {
  const [allLogs, setAllLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  const fetchAllLogs = useCallback(async () => {
    setLoading(true);
    try {
      const baseRef = collection(db, "loginLogs");
      const q = query(baseRef, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllLogs();
  }, [fetchAllLogs]);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    const filtered = allLogs.filter(
      (log) =>
        log.displayName?.toLowerCase().includes(lower) ||
        log.email?.toLowerCase().includes(lower)
    );
    setFilteredLogs(filtered);
    setCurrentPage(0);
  }, [searchQuery, allLogs]);

  const paginatedLogs = filteredLogs.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  return (
    <>
      <h2 style={{ marginBottom: 20, color: "#002D8B" }}>📜 ประวัติการเข้าใช้งานระบบ</h2>

      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 10 }}>แสดงรายการต่อหน้า:</label>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(0);
          }}
        >
          {[10, 25, 50].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20, position: "relative", display: "inline-block" }}>
        <label style={{ marginRight: 10 }}>ค้นหาด้วยชื่อหรืออีเมล:</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="พิมพ์ชื่อหรืออีเมล..."
          style={{
            padding: "8px 32px 8px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            width: 300
          }}
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(0);
            }}
            style={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              fontSize: 16,
              cursor: "pointer",
              color: "#d00",
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {loading && allLogs.length === 0 ? (
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
              {paginatedLogs.map((log, index) => (
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

          <div style={{ textAlign: "center", marginTop: 30 }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
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
          </div>
        </>
      )}
    </>
  );
}

export default AdminLogsPage;