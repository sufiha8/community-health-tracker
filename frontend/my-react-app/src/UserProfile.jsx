import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./UserProfile.css";
import DailyHealthLog from "./DailyHealthLog";
import Settings from "./Settings";
import HealthHistory from "./HealthHistory";
import CommunityDashboard from "./CommunityDashboard";
import NotificationBell from "./NotificationBell";
import HealthTrendsChart from "./HealthTrendsChart";
import HealthScore from "./HealthScore";
import { generateHealthReport, exportLogsCSV } from "./report";
import VaccineSchedule from "./VaccineSchedule";
import SymptomChecker from "./SymptomChecker";
import EmergencyButton from "./EmergencyButton";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { ref, set, onValue } from "firebase/database";
import { useToast } from "./ToastContext";

function UserProfile({ userProfile = {}, initialPage = "profile" }) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [page, setPage] = useState(initialPage);
  const [name, setName] = useState(userProfile.username || "");
  const [age, setAge] = useState(userProfile.age || "");
  const [gender, setGender] = useState(userProfile.gender || "");
  const [conditions, setConditions] = useState(userProfile.conditions || "");
  const [editingLog, setEditingLog] = useState(null);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  // fetch current user's logs for reports
  useEffect(() => {
    if (page === "reports") {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const logsRef = ref(db, `healthLogs/${uid}`);
        onValue(logsRef, (snap) => {
          const val = snap.val() || {};
          const arr = Object.entries(val)
            .map(([id, l]) => ({ id, ...l }))
            .sort((a, b) => b.createdAt - a.createdAt);
          setUserLogs(arr);
        });
      }
    }
  }, [page]);

  useEffect(() => {
    setName(userProfile.username || "");
    setAge(userProfile.age || "");
    setGender(userProfile.gender || "");
    setConditions(userProfile.conditions || "");
  }, [userProfile]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      showToast("Please login to save profile", "error");
      return;
    }

    try {
      // use update so we don't wipe other existing fields such as phone/address
      const updates = {
        username: name,
        age,
        gender,
        conditions,
        role: userProfile.role || "user",
        email: userProfile.email || user.email,
      };
      await update(ref(db, `users/${user.uid}`), updates);
      showToast("Profile saved", "success");
      setPage("daily");
    } catch (err) {
      console.error(err);
      showToast("Failed to save profile", "error");
    }
  };

  let content;
  if (page === "profile") {
    content = (
      <div className="profile-card">
        <h3>Profile Details</h3>

        <div className="form-group">
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            value={age}
            onChange={(e) => setAge(e.target.value)}
            type="number"
            placeholder="Enter your age"
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select gender</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Health Conditions</label>
          <textarea
            rows="3"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder="Enter health conditions (if any)"
          />
        </div>
        <button className="save-btn" onClick={handleSave}>
          Save Profile
        </button>
      </div>
    );
  }

  const handleEditLog = (log) => {
    setEditingLog(log);
    setPage("daily");
  };

  const handleLogSaved = () => {
    setEditingLog(null);
    setPage("history");
  };

  const [userLogs, setUserLogs] = useState([]);
  const handleGenerateReport = () => {
    generateHealthReport(userLogs, { username: name });
  };
  const handleExportCSV = () => {
    exportLogsCSV(userLogs);
  };

  if (page === "settings") {
    content = <Settings />;
  } else if (page === "daily") {
    content = (
      <DailyHealthLog
        editingLog={editingLog}
        onSaved={handleLogSaved}
        onCancel={() => {
          setEditingLog(null);
          setPage("history");
        }}
      />
    );
  } else if (page === "history") {
    content = <HealthHistory onEdit={handleEditLog} />;
  } else if (page === "community" || page === "announcements") {
    // community dashboard also serves as announcements page
    content = <CommunityDashboard />;
  } else if (page === "reports") {
    content = (
      <>
        <HealthTrendsChart logs={userLogs} />
        <HealthScore logs={userLogs} />
        <div style={{ marginTop: 16 }}>
          <button onClick={handleGenerateReport} style={{ marginRight: 8 }}>
            {t
              ? t("Download Health Report (PDF)")
              : "Download Health Report (PDF)"}
          </button>
          <button onClick={handleExportCSV} className="outline-btn">
            {t ? t("Export Logs (CSV)") : "Export Logs (CSV)"}
          </button>
        </div>
      </>
    );
  } else if (page === "vaccine") {
    content = <VaccineSchedule />;
  } else if (page === "symptoms") {
    content = <SymptomChecker />;
  }

  const [showAvatarCard, setShowAvatarCard] = useState(false);

  const toggleAvatarCard = () => {
    // always allow showing the card; will display placeholders if fields missing
    setShowAvatarCard((v) => !v);
  };

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Community Health</h2>

        <ul className="nav-links">
          <li
            role="button"
            tabIndex={0}
            className={page === "profile" ? "active" : ""}
            onClick={() => setPage("profile")}
            onKeyPress={(e) => e.key === "Enter" && setPage("profile")}
          >
            Profile
          </li>
          <li
            className={page === "daily" ? "active" : ""}
            onClick={() => setPage("daily")}
          >
            Daily Health Log
          </li>
          <li
            className={page === "history" ? "active" : ""}
            onClick={() => setPage("history")}
          >
            Health History
          </li>
          <li
            className={page === "reports" ? "active" : ""}
            onClick={() => setPage("reports")}
          >
            Trends / Report
          </li>
          <li
            className={page === "vaccine" ? "active" : ""}
            onClick={() => setPage("vaccine")}
          >
            Vaccines
          </li>
          <li
            className={page === "symptoms" ? "active" : ""}
            onClick={() => setPage("symptoms")}
          >
            Symptom Checker
          </li>
          {/* NEW: direct link to announcements */}
          <li
            className={page === "announcements" ? "active" : ""}
            onClick={() => setPage("announcements")}
          >
            Announcements
          </li>
          <li
            role="button"
            tabIndex={0}
            className={page === "settings" ? "active" : ""}
            onClick={() => setPage("settings")}
            onKeyPress={(e) => e.key === "Enter" && setPage("settings")}
          >
            Settings
          </li>
          <li>
            <EmergencyButton />
          </li>
        </ul>
      </aside>

      {/* Main content */}
      <div className="main-area">
        {/* Top bar */}
        <header className="topbar">
          <span className="menu-icon">☰</span>

          <div className="topbar-right">
            <NotificationBell />
            <button
              className="logout-btn"
              onClick={() =>
                signOut(auth)
                  .then(() => window.location.reload())
                  .catch(() => showToast("Failed to logout", "error"))
              }
            >
              Logout
            </button>
            <div className="avatar" onClick={toggleAvatarCard}>
              {((userProfile && userProfile.username) || "U")
                .charAt(0)
                .toUpperCase()}
              {showAvatarCard &&
                (() => {
                  const nameToShow =
                    userProfile && userProfile.username
                      ? userProfile.username
                      : "(no name)";
                  const emailToShow =
                    (userProfile && userProfile.email) ||
                    auth.currentUser?.email ||
                    "(no email)";
                  const phoneToShow =
                    userProfile && userProfile.phone
                      ? userProfile.phone
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

        {content}
      </div>
    </div>
  );
}

export default UserProfile;
