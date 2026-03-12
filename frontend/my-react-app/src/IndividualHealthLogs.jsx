import Sidebar from "./Sidebar";
import "./IndividualHealthLogs.css";
import { useEffect, useState } from "react";
import { ref, onValue, remove, get } from "firebase/database";
import { db } from "./firebase";
import { useToast } from "./ToastContext";

function IndividualHealthLogs({ embedded = false }) {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [pageSize, setPageSize] = useState(5);
  const [pageIdx, setPageIdx] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  useEffect(() => {
    const logsRef = ref(db, "healthLogs");
    const usersRef = ref(db, "users");

    const unsub = onValue(logsRef, (snapLogs) => {
      const logsVal = snapLogs.val() || {};
      onValue(
        usersRef,
        (snapUsers) => {
          const usersVal = snapUsers.val() || {};

          const merged = Object.entries(logsVal).map(([uid, logsObj]) => {
            const username = usersVal[uid]?.username || uid;
            const logs = Object.entries(logsObj)
              .map(([id, log]) => ({ id, ...log }))
              .sort((a, b) => b.createdAt - a.createdAt);
            return { uid, username, logs };
          });

          setData(merged);
        },
        { onlyOnce: false },
      );
    });

    return () => unsub();
  }, []);

  // flatten and filter
  const flattened = data.flatMap((user) =>
    user.logs.map((l) => ({ uid: user.uid, username: user.username, ...l })),
  );

  const filtered = flattened.filter((l) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      (l.username || "").toLowerCase().includes(q) ||
      (l.date || "").toLowerCase().includes(q) ||
      (l.bp || "").toLowerCase().includes(q) ||
      (l.sugar || "").toLowerCase().includes(q) ||
      (l.symptoms || "").toLowerCase().includes(q)
    );
  });

  // extra filters (high bp / high sugar / symptoms)
  const applyExtraFilter = (items, mode) => {
    if (!mode || mode === "all") return items;
    if (mode === "high-bp") {
      return items.filter((it) => {
        if (!it.bp) return false;
        const parts = it.bp.split("/").map((s) => parseInt(s, 10));
        if (parts.length >= 2) {
          const [sys, dia] = parts;
          return sys >= 140 || dia >= 90;
        }
        return false;
      });
    }
    if (mode === "high-sugar") {
      return items.filter((it) => {
        const num = parseInt((it.sugar || "").replace(/[^0-9]/g, ""), 10);
        return !isNaN(num) && num >= 140;
      });
    }
    if (mode === "symptoms") {
      return items.filter((it) => (it.symptoms || "").trim().length > 0);
    }
    if (mode === "risk") {
      return items.filter((it) => Array.isArray(it.risks) && it.risks.length);
    }
    return items;
  };

  // apply filter mode and pagination
  const filteredExtra = applyExtraFilter(filtered, filterMode);
  const totalPages = Math.max(1, Math.ceil(filteredExtra.length / pageSize));
  const paged = filteredExtra.slice(
    pageIdx * pageSize,
    (pageIdx + 1) * pageSize,
  );

  // helper to open user details (used by avatar button and name)
  const openUserDetails = async (uid, e) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    console.log("openUserDetails clicked", uid);
    showToast("Loading user details...", "info");
    try {
      const snap = await get(ref(db, `users/${uid}`));
      const u = snap.exists() ? snap.val() : null;
      setSelectedUser({ uid, ...u });
      showToast("User details loaded", "success");
    } catch (err) {
      console.error("Failed to load user", err);
      showToast("Failed to load user details", "error");
    }
  };
  const contentBlock = (
    <>
      <h2>Individual Health Logs</h2>

      <div
        className="ihl-filters"
        style={{ display: "flex", gap: 8, alignItems: "center" }}
      >
        <input
          placeholder="Search logs by name, date, or condition"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPageIdx(0);
          }}
        />

        <select
          value={filterMode}
          onChange={(e) => {
            setFilterMode(e.target.value);
            setPageIdx(0);
          }}
        >
          <option value="all">All</option>
          <option value="high-bp">High BP</option>
          <option value="high-sugar">High Sugar</option>
          <option value="symptoms">Has Symptoms</option>
          <option value="risk">Has Risk Alerts</option>
        </select>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <label>Page size</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPageIdx(0);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Body: list + side detail */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ flex: 2 }}>
          {/* Table */}
          <div className="table-wrapper">
            {paged.length === 0 ? (
              <p>No logs found.</p>
            ) : (
              paged.map((item, i) => (
                <div
                  key={`${item.uid}-${item.id || item.createdAt}-${i}`}
                  style={{ marginBottom: 12 }}
                  onClick={(e) => {
                    console.log("item clicked (container)", item.uid, item.id);
                    try {
                      showToast && showToast("Item container clicked", "info");
                    } catch (err) {}
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <button
                      type="button"
                      className="avatar-btn"
                      onMouseDown={(e) => {
                        console.log("avatar mousedown", item.uid);
                        try {
                          showToast && showToast("Avatar pressed", "info");
                        } catch (err) {}
                      }}
                      onClick={(e) => openUserDetails(item.uid, e)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          openUserDetails(item.uid, e);
                      }}
                      tabIndex={0}
                      aria-label={`View ${item.username || "user"} details`}
                      title={`View ${item.username || "user"} details`}
                      style={{
                        position: "relative",
                        zIndex: 2,
                        pointerEvents: "auto",
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        border: "none",
                        background: "#eee",
                        cursor: "pointer",
                      }}
                    >
                      {(item.username || "U").charAt(0).toUpperCase()}
                    </button>

                    <h4
                      style={{ margin: 0, cursor: "pointer" }}
                      onClick={(e) => openUserDetails(item.uid, e)}
                    >
                      {item.username}
                    </h4>
                  </div>

                  <div className="history-card" style={{ marginTop: 8 }}>
                    <div className="history-row">
                      <span>Date</span>
                      <strong>{item.date}</strong>
                    </div>
                    <div className="history-row">
                      <span>BP</span>
                      <strong>{item.bp}</strong>
                    </div>
                    <div className="history-row">
                      <span>Sugar</span>
                      <strong>{item.sugar}</strong>
                    </div>
                    <div className="history-row">
                      <span>Symptoms</span>
                      <strong>{item.symptoms}</strong>
                    </div>
                    {item.risks && item.risks.length > 0 && (
                      <div className="history-row" style={{ color: "#b91c1c" }}>
                        <span>Alerts</span>
                        <strong>{item.risks.join(", ")}</strong>
                      </div>
                    )}
                    <small>{new Date(item.createdAt).toLocaleString()}</small>

                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        className="delete-btn"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const ok = window.confirm("Delete this log?");
                          if (!ok) return;
                          try {
                            await remove(
                              ref(db, `healthLogs/${item.uid}/${item.id}`),
                            );
                            showToast("Log deleted", "success");
                          } catch (err) {
                            console.error("Failed to delete log", err);
                            showToast("Failed to delete log", "error");
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Pager */}
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <button
                disabled={pageIdx === 0}
                onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
              >
                Prev
              </button>
              <div>
                Page {pageIdx + 1} / {totalPages}
              </div>
              <button
                disabled={pageIdx >= totalPages - 1}
                onClick={() =>
                  setPageIdx((p) => Math.min(totalPages - 1, p + 1))
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ width: 320 }}>
          <div className="side-card">
            {selectedUser ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h4 style={{ margin: 0 }}>
                    {selectedUser.username || "User"}
                  </h4>
                  <button
                    className="close-btn"
                    onClick={() => setSelectedUser(null)}
                  >
                    Close
                  </button>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="history-row">
                    <span>Age</span>
                    <strong>{selectedUser.age || "-"}</strong>
                  </div>
                  <div className="history-row">
                    <span>Email</span>
                    <strong>{selectedUser.email || "-"}</strong>
                  </div>
                  <div className="history-row">
                    <span>Phone</span>
                    <strong>{selectedUser.phone || "-"}</strong>
                  </div>
                  <div className="history-row">
                    <span>Conditions</span>
                    <strong>{selectedUser.conditions || "-"}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ minHeight: 40 }} />
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (embedded) {
    return <div className="ihl-content">{contentBlock}</div>;
  }

  return (
    <div className="ihl-page">
      {/* Sidebar */}
      <Sidebar variant="admin" className="ihl-sidebar" />

      {/* Main */}
      <div className="ihl-main">
        {/* Topbar */}
        <header className="ihl-topbar">
          <div className="top-search">
            <input
              placeholder="Search logs by name, date, or condition"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="topbar-right">
            <span>🔔 Notifications</span>
            <div className="avatar">A</div>
          </div>
        </header>

        {/* Content */}
        <div className="ihl-content">{contentBlock}</div>
      </div>
    </div>
  );
}

export default IndividualHealthLogs;
