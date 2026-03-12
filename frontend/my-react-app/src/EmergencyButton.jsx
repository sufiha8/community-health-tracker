import { push, ref, get, update } from "firebase/database";
import { auth, db } from "./firebase";
import { useToast } from "./ToastContext";
import { logAction } from "./logAction";

export default function EmergencyButton() {
  const { showToast } = useToast();
  const sendAlert = async () => {
    const user = auth.currentUser;
    if (!user)
      return showToast("Please login to send emergency alert", "error");
    try {
      await push(ref(db, "emergencies"), {
        uid: user.uid,
        createdAt: Date.now(),
      });

      // notify admins so they see an in‑app notification
      try {
        const usersSnap = await get(ref(db, "users"));
        const users = usersSnap.val() || {};
        const updates = {};
        Object.entries(users).forEach(([uid, profile]) => {
          if (profile.role === "admin") {
            const key = push(ref(db, `/notifications/${uid}`)).key;
            updates[`/notifications/${uid}/${key}`] = {
              text: `Emergency alert sent by ${user.uid}`,
              type: "emergency",
              createdAt: Date.now(),
              read: false,
            };
          }
        });
        if (Object.keys(updates).length) await update(ref(db), updates);
      } catch (err) {
        console.error("Failed to send admin notifications", err);
      }

      showToast("Emergency alert sent 🚨", "success");
      logAction("emergency_sent", {});
    } catch (err) {
      console.error(err);
      showToast("Failed to send emergency alert", "error");
    }
  };

  return (
    <button className="emergency-btn" onClick={sendAlert}>
      🚨 Emergency
    </button>
  );
}
