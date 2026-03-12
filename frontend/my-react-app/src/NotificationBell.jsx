import { useEffect, useState } from "react";
import { ref, onValue, push, update, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth, messaging } from "./firebase";
import { useToast } from "./ToastContext";
import { onMessage } from "firebase/messaging";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [prefs, setPrefs] = useState({ notificationsEnabled: true });
  const navigate = useNavigate();

  useEffect(() => {
    let unsubOnValue = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // cleanup any previous subscription
      if (unsubOnValue) {
        unsubOnValue();
        unsubOnValue = null;
      }

      if (!user) {
        setNotifications([]);
        return;
      }
      // fetch user preferences (push opt-in)
      get(ref(db, `users/${user.uid}/prefs`)).then((snap) => {
        if (snap.exists()) setPrefs(snap.val());
      });

      const nRef = ref(db, `notifications/${user.uid}`);
      unsubOnValue = onValue(nRef, (snap) => {
        const val = snap.val() || {};
        const arr = Object.entries(val)
          .map(([id, n]) => ({ id, ...n }))
          .sort((a, b) => b.createdAt - a.createdAt);
        setNotifications(arr);
      });
    });

    return () => {
      if (unsubOnValue) unsubOnValue();
      if (typeof unsubAuth === "function") unsubAuth();
    };
  }, []);

  // show FCM messages in toast
  useEffect(() => {
    if (!messaging || !prefs.notificationsEnabled) return;
    const unsub = onMessage(messaging, (payload) => {
      if (payload.notification && payload.notification.body) {
        showToast(payload.notification.body, "info");
      }
    });
    return unsub;
  }, [showToast, prefs.notificationsEnabled]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const updates = {};
    notifications.forEach((n) => {
      if (!n.read) updates[`/notifications/${uid}/${n.id}/read`] = true;
    });
    if (Object.keys(updates).length === 0) return;
    try {
      await update(ref(db), updates);
    } catch (err) {
      console.error("Failed to mark notifications read", err);
      showToast("Failed to mark notifications read", "error");
    }
  };

  const handleToggle = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      // mark unread as read when opened
      await markAllRead();
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        className="notification"
        onClick={handleToggle}
        title="Notifications"
        aria-label="Notifications"
        style={{ position: "relative" }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              background: "#ef4444",
              color: "white",
              borderRadius: 12,
              padding: "2px 6px",
              fontSize: 12,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 36,
            width: 360,
            maxHeight: 420,
            overflow: "auto",
            background: "white",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            borderRadius: 8,
            padding: 12,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong>Notifications</strong>
            <button
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: 12 }}>{t("No notifications")}</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (n.link) navigate(n.link);
                  else if (n.type === "emergency") navigate("/admin");
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    if (n.link) navigate(n.link);
                    else if (n.type === "emergency") navigate("/admin");
                  }
                }}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  background: n.read ? "#fff" : "#f0f9ff",
                  marginTop: 8,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 13, color: "#333" }}>{n.text}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
