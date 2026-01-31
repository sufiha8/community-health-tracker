import './UserProfile.css';

export default function DailyHealthLog() {
  return (
    <div className="profile-card">
      <h3>Daily Health Log</h3>
      <p>Record your daily vitals and notes here.</p>
      <div className="form-group">
        <label>Temperature</label>
        <input placeholder="e.g., 98.6°F" />
      </div>
      <div className="form-group">
        <label>Blood Pressure</label>
        <input placeholder="e.g., 120/80" />
      </div>
      <button className="save-btn">Save Log</button>
    </div>
  );
}
