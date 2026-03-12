import { useState } from "react";

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState({});
  const handleSubmit = () => {
    const keys = Object.entries(symptoms)
      .filter(([k, v]) => v)
      .map(([k]) => k);
    let msg = "";
    if (keys.includes("fever") && keys.includes("cough")) {
      msg = "You may have a viral infection. Consult a doctor.";
    } else if (keys.includes("headache")) {
      msg = "You may have a tension headache. Rest and stay hydrated.";
    } else if (keys.length === 0) {
      msg = "No symptoms selected.";
    } else {
      msg = "Please consult a doctor for proper diagnosis.";
    }
    alert(msg);
  };

  return (
    <div className="profile-card">
      <h3>Symptom Checker</h3>
      {["fever", "cough", "headache"].map((s) => (
        <label key={s} style={{ display: "block", marginTop: 6 }}>
          <input
            type="checkbox"
            checked={!!symptoms[s]}
            onChange={(e) =>
              setSymptoms({ ...symptoms, [s]: e.target.checked })
            }
          />{" "}
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </label>
      ))}
      <button
        className="primary-btn"
        onClick={handleSubmit}
        style={{ marginTop: 12 }}
      >
        Check
      </button>
    </div>
  );
}
