import { useState, useEffect } from "react";
import "./DailyHealthLog.css";
import { ref, push, set } from "firebase/database";
import { auth, db } from "./firebase";
import { useToast } from "./ToastContext";
import { assessRisk } from "./risk";

function DailyHealthLog({ editingLog = null, onSaved, onCancel }) {
  const { showToast } = useToast();
  // ✅ NEW: state
  const [date, setDate] = useState("");
  const [bp, setBp] = useState("");
  const [sugar, setSugar] = useState("");
  const [symptoms, setSymptoms] = useState("");

  // if editingLog changes, pre-fill form
  useEffect(() => {
    if (editingLog) {
      setDate(editingLog.date || "");
      setBp(editingLog.bp || "");
      setSugar(editingLog.sugar || "");
      setSymptoms(editingLog.symptoms || "");
    } else {
      setDate("");
      setBp("");
      setSugar("");
      setSymptoms("");
    }
  }, [editingLog]);

  // ✅ NEW: save function
  const handleSave = async () => {
    const updatedLog = {
      date,
      bp,
      sugar,
      symptoms,
      // preserve createdAt when editing; use now for new
      createdAt: editingLog?.createdAt || Date.now(),
    };

    // If user is authenticated, write to Firebase Realtime DB under healthLogs/{uid}
    const user = auth.currentUser;
    if (!user) {
      // fallback to localStorage when not signed in
      const existingLogs = JSON.parse(localStorage.getItem("healthLogs")) || [];
      if (editingLog) {
        // update local
        const updated = existingLogs.map((l) =>
          l.createdAt === editingLog.createdAt ? { ...l, ...updatedLog } : l,
        );
        localStorage.setItem("healthLogs", JSON.stringify(updated));
        showToast("Local log updated.", "success");
        onSaved && onSaved();
        return;
      }

      // create new local
      existingLogs.push(updatedLog);
      localStorage.setItem("healthLogs", JSON.stringify(existingLogs));
      showToast("Saved locally. Sign in to sync logs to cloud.", "info");
      onSaved && onSaved();
      return;
    }

    try {
      if (editingLog && editingLog.id) {
        // update existing record
        await set(
          ref(db, `healthLogs/${user.uid}/${editingLog.id}`),
          updatedLog,
        );
        showToast("Daily health log updated in cloud!", "success");
      } else {
        // create new
        const logsRef = ref(db, `healthLogs/${user.uid}`);
        const newRef = push(logsRef);
        await set(newRef, updatedLog);
        showToast("Daily health log saved to cloud!", "success");
      }

      // after save, assess risk and optionally store message
      const risks = assessRisk({ bp: updatedLog.bp, sugar: updatedLog.sugar });
      if (risks.length) {
        showToast(
          "⚠️ " + risks.join(", ") + ". Please consult doctor.",
          "warning",
        );
        // attach risk info to log entry in database if user
        try {
          const uid = user.uid;
          const key = editingLog?.id || newRef?.key;
          if (uid && key) {
            await set(ref(db, `healthLogs/${uid}/${key}/risks`), risks);
          }
        } catch (err) {
          console.error("Failed to write risk info", err);
        }
      }
      onSaved && onSaved();
    } catch (err) {
      console.error("Failed to save log to Firebase:", err);
      // fallback to localStorage
      const existingLogs = JSON.parse(localStorage.getItem("healthLogs")) || [];
      if (editingLog) {
        const updated = existingLogs.map((l) =>
          l.createdAt === editingLog.createdAt ? { ...l, ...updatedLog } : l,
        );
        localStorage.setItem("healthLogs", JSON.stringify(updated));
        showToast(
          "Failed to save to cloud; updated locally instead.",
          "warning",
        );
        onSaved && onSaved();
        return;
      }
      existingLogs.push(updatedLog);
      localStorage.setItem("healthLogs", JSON.stringify(existingLogs));
      showToast("Failed to save to cloud; saved locally instead.", "error");
      onSaved && onSaved();
    }
  };

  return (
    <div className="health-card">
      <h3>Daily Health Log</h3>

      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <small>Select the date for this log entry.</small>
      </div>

      <div className="form-group">
        <label>Blood Pressure (BP)</label>
        <input
          type="text"
          placeholder="e.g., 120/80 mmHg"
          value={bp}
          onChange={(e) => setBp(e.target.value)}
        />
        <small>Enter your systolic and diastolic blood pressure.</small>
      </div>

      <div className="form-group">
        <label>Blood Sugar</label>
        <input
          type="text"
          placeholder="e.g., 95 mg/dL"
          value={sugar}
          onChange={(e) => setSugar(e.target.value)}
        />
        <small>Enter your blood sugar level.</small>
      </div>

      <div className="form-group">
        <label>Symptoms</label>
        <textarea
          rows="3"
          placeholder="Describe any symptoms (e.g., headache, fatigue)"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <small>List any symptoms you are experiencing.</small>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="save-btn" onClick={handleSave}>
          {editingLog ? "Update Log" : "Save Log"}
        </button>
        {editingLog && (
          <button
            className="delete-btn"
            onClick={() => {
              onCancel && onCancel();
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default DailyHealthLog;
