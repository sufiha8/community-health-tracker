import { useEffect, useState, useRef } from "react";
import { ref, onValue, push, get, update } from "firebase/database";
import { logAction } from "./logAction";
import { db, auth } from "./firebase";
import { useToast } from "./ToastContext";

import { useParams, useNavigate } from "react-router-dom";

export default function VaccineSchedule({ driveId }) {
  const { showToast } = useToast();
  const [drives, setDrives] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const vRef = ref(db, "vaccines");
    const unsub = onValue(vRef, (snap) => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, v]) => ({ id, ...v }));
      setDrives(arr);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // check if current user is admin
    const uid = auth.currentUser?.uid;
    if (uid) {
      get(ref(db, `users/${uid}/role`)).then((snap) => {
        if (snap.exists() && snap.val() === "admin") setIsAdmin(true);
      });
    }
  }, []);

  const postDrive = async (e) => {
    e.preventDefault();
    if (!title || !date) return showToast("Title and date required", "error");
    try {
      const p = await push(ref(db, "vaccines"), {
        title,
        date,
        startTime,
        endTime,
        createdAt: Date.now(),
      });
      setTitle("");
      setDate("");
      showToast("Vaccine drive posted", "success");

      // notify all users
      const usersSnap = await get(ref(db, "users"));
      const users = usersSnap.val() || {};
      const updates = {};
      Object.keys(users).forEach((uid) => {
        const notifKey = push(ref(db, `/notifications/${uid}`)).key;
        updates[`/notifications/${uid}/${notifKey}`] = {
          text: `New vaccine drive: ${title} on ${date}`,
          vaccineId: p.key,
          link: `/vaccine/${p.key}`,
          createdAt: Date.now(),
          read: false,
        };
      });
      // audit
      logAction("vaccine_drive_create", { title, date });
      if (Object.keys(updates).length) {
        await update(ref(db), updates);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to post drive", "error");
    }
  };

  // if driveId passed, show only that drive (detail view)
  const today = Date.now();
  const upcoming = drives.filter((d) => {
    const dts = new Date(d.date).getTime();
    return dts >= today && dts <= today + 7 * 24 * 3600 * 1000;
  });
  const selected =
    driveId !== undefined ? drives.find((d) => d.id === driveId) || null : null;

  const navigate = useNavigate();
  const notifiedRef = useRef(new Set());
  useEffect(() => {
    if (isAdmin) return;
    const newDrives = upcoming.filter((d) => !notifiedRef.current.has(d.id));
    if (newDrives.length > 0) {
      showToast(
        `Upcoming vaccine drives: ${newDrives.map((d) => d.title).join(", ")}`,
        "info",
      );
      newDrives.forEach((d) => notifiedRef.current.add(d.id));
    }
  }, [upcoming, isAdmin]);

  return (
    <div>
      <h3>Vaccine Schedule</h3>
      {isAdmin && (
        <form onSubmit={postDrive}>
          <input
            placeholder="Drive title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="Start time"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="End time"
          />
          <button className="primary-btn">Post Drive</button>
        </form>
      )}
      {isAdmin && <hr />}
      <h4>Upcoming Drives</h4>
      {upcoming.length === 0 ? (
        <p>No drives within next week.</p>
      ) : (
        upcoming.map((d) => (
          <div
            key={d.id}
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/vaccine/${d.id}`)}
          >
            <strong>{d.title}</strong> - {d.date}
            {d.startTime && <> @ {d.startTime}</>}
            {d.endTime && <> to {d.endTime}</>}
          </div>
        ))
      )}
    </div>
  );
}
