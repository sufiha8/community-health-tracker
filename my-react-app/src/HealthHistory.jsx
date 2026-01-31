import './UserProfile.css';

export default function HealthHistory() {
  return (
    <div className="profile-card">
      <h3>Health History</h3>
      <p>View your past health logs and history here.</p>
      <div style={{ marginTop: 12 }}>
        <div className="form-group">
          <label>Example Entry</label>
          <textarea rows="3" placeholder="Sample previous entry" />
        </div>
      </div>
    </div>
  );
}
