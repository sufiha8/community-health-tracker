import "./UserProfile.css";

import { useEffect, useState } from "react";
import "./HealthHistory.css";
import { ref, onValue, remove } from "firebase/database";
import { auth } from "./firebase";
import { db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "./ToastContext";

function HealthHistory({ onEdit }) {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let dbUnsub;

    const handleSetLocal = () => {
      const savedLogs = JSON.parse(localStorage.getItem("healthLogs")) || [];
      setLogs(savedLogs);
    };

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const logsRef = ref(db, `healthLogs/${user.uid}`);
        dbUnsub = onValue(logsRef, (snapshot) => {
          const val = snapshot.val();
          const arr = val
            ? Object.entries(val)
                .map(([id, log]) => ({ id, ...log }))
                .sort((a, b) => b.createdAt - a.createdAt)
            : [];
          setLogs(arr);
        });
      } else {
        // fallback to localStorage when not signed in
        handleSetLocal();
      }
    });

    return () => {
      if (typeof dbUnsub === "function") dbUnsub();
      if (typeof unsubAuth === "function") unsubAuth();
    };
  }, []);

  const handleDelete = async (log) => {
    const user = auth.currentUser;
    const confirm = window.confirm("Are you sure you want to delete this log?");
    if (!confirm) return;

    if (user && log.id) {
      try {
        await remove(ref(db, `healthLogs/${user.uid}/${log.id}`));
        showToast("Log deleted", "success");
      } catch (err) {
        console.error("Failed to delete log:", err);
        showToast("Failed to delete log", "error");
      }
    } else {
      // localStorage fallback
      const savedLogs = JSON.parse(localStorage.getItem("healthLogs")) || [];
      const filtered = savedLogs.filter((l) => l.createdAt !== log.createdAt);
      localStorage.setItem("healthLogs", JSON.stringify(filtered));
      setLogs(filtered);
      showToast("Local log deleted", "success");
    }
  };

  return (
    <div className="profile-card">
      <h3>Health History</h3>

      {logs.length === 0 ? (
        <p className="empty-text">No health logs saved yet.</p>
      ) : (
        <div className="history-list">
          {logs.map((log) => (
            <div key={log.id || log.createdAt} className="history-card">
              <div className="history-row">
                <span>Date</span>
                <strong>{log.date}</strong>
              </div>

              <div className="history-row">
                <span>BP</span>
                <strong>{log.bp}</strong>
              </div>

              <div className="history-row">
                <span>Sugar</span>
                <strong>{log.sugar}</strong>
              </div>

              <div className="history-row">
                <span>Symptoms</span>
                <strong>{log.symptoms}</strong>
              </div>
              {log.risks && log.risks.length > 0 && (
                <div className="history-row" style={{ color: "#b91c1c" }}>
                  <span>Alerts</span>
                  <strong>{log.risks.join(", ")}</strong>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  className="edit-btn"
                  onClick={() => onEdit && onEdit(log)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(log)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HealthHistory;
