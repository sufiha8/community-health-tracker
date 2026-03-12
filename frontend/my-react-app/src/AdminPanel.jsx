import { useState, useEffect } from "react";
import AdminAnnouncements from "./AdminAnnouncements";
import IndividualHealthLogs from "./IndividualHealthLogs";
import AdminDashboard from "./AdminDashboard";
import VaccineSchedule from "./VaccineSchedule";
import AuditDashboard from "./AuditDashboard";
import Settings from "./Settings";
import "./AdminPanel.css";
import NotificationBell from "./NotificationBell";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { ref, get } from "firebase/database";
import { useToast } from "./ToastContext";

export default function AdminPanel() {
  const [page, setPage] = useState("dashboard");
  const { showToast } = useToast();
  const [showAvatarCard, setShowAvatarCard] = useState(false);
  const [adminProfile, setAdminProfile] = useState({});

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      get(ref(db, `users/${uid}`)).then((snap) => {
        if (snap.exists()) {
          const data = snap.val();
          setAdminProfile({
            ...data,
            email: data.email || auth.currentUser.email,
          });
        }
      });
    }
  }, []);

  const toggleAvatarCard = () => {
    // open even if fields are empty; placeholders will show
    setShowAvatarCard((v) => !v);
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>Admin</h2>
        <ul>
          <li
            role="button"
            tabIndex={0}
            onClick={() => setPage("dashboard")}
            onKeyPress={(e) => e.key === "Enter" && setPage("dashboard")}
            className={page === "dashboard" ? "active" : ""}
          >
            Dashboard
          </li>
          <li
            role="button"
            tabIndex={0}
            onClick={() => setPage("announcements")}
            onKeyPress={(e) => e.key === "Enter" && setPage("announcements")}
            className={page === "announcements" ? "active" : ""}
          >
            Announcements
          </li>
          <li
            role="button"
            tabIndex={0}
            onClick={() => setPage("health")}
            onKeyPress={(e) => e.key === "Enter" && setPage("health")}
            className={page === "health" ? "active" : ""}
          >
            Individual Health Logs
          </li>
          <li
            role="button"
            tabIndex={0}
            onClick={() => setPage("vaccines")}
            onKeyPress={(e) => e.key === "Enter" && setPage("vaccines")}
            className={page === "vaccines" ? "active" : ""}
          >
            Vaccine Drives
          </li>
          <li
            role="button"
            tabIndex={0}
            onClick={() => setPage("audit")}
            onKeyPress={(e) => e.key === "Enter" && setPage("audit")}
            className={page === "audit" ? "active" : ""}
          >
            Audit Log
          </li>
          <li
            role="button"
            tabIndex={0}
            onClick={() => setPage("settings")}
            onKeyPress={(e) => e.key === "Enter" && setPage("settings")}
            className={page === "settings" ? "active" : ""}
          >
            Settings
          </li>
        </ul>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div />
          <div className="topbar-right">
            <NotificationBell />
            <button
              className="logout-btn"
              onClick={() =>
                signOut(auth)
                  .then(() => window.location.reload())
                  .catch(
                    () => showToast && showToast("Failed to logout", "error"),
                  )
              }
            >
              Logout
            </button>
            <div className="avatar" onClick={toggleAvatarCard}>
              {((adminProfile && adminProfile.username) || "A")
                .charAt(0)
                .toUpperCase()}
              {showAvatarCard &&
                (() => {
                  const nameToShow =
                    adminProfile && adminProfile.username
                      ? adminProfile.username
                      : "(admin)";
                  const emailToShow =
                    adminProfile && adminProfile.email
                      ? adminProfile.email
                      : "(no email)";
                  const phoneToShow =
                    adminProfile && adminProfile.phone
                      ? adminProfile.phone
                      : "(no phone)";
                  return (
                    <div className="avatar-card">
                      <div>
                        <strong>{nameToShow}</strong>
                      </div>
                      <div>{emailToShow}</div>
                      <div>{phoneToShow}</div>
                    </div>
                  );
                })()}
            </div>
          </div>
        </header>

        {page === "dashboard" && <AdminDashboard />}
        {page === "announcements" && <AdminAnnouncements />}
        {page === "health" && <IndividualHealthLogs embedded={true} />}
        {page === "vaccines" && <VaccineSchedule />}
        {page === "audit" && <AuditDashboard />}
        {page === "settings" && <Settings />}
      </main>
    </div>
  );
}
