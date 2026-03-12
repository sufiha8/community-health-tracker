import Sidebar from "./Sidebar";
import "./Announcements.css";

function Announcements() {
  return (
    <div className="ann-page">
      {/* Sidebar */}
      <Sidebar variant="admin" className="ann-sidebar" />

      {/* Main area */}
      <div className="ann-main">
        {/* Topbar */}
        <header className="ann-topbar">
          <div></div>
          <div className="topbar-right">
            <span>🔔 Notifications</span>
            <button className="logout">Logout</button>
            <div className="avatar">U</div>
          </div>
        </header>

        {/* Content */}
        <div className="ann-content">
          {/* Create announcement */}
          <div className="create-box">
            <h3>Create New Announcement</h3>
            <textarea placeholder="Enter announcement details here..." />
            <button>Submit Announcement</button>
          </div>

          {/* Past announcements */}
          <h4 className="past-title">Past Announcements</h4>

          <div className="announcement-card">
            <div className="card-header">
              <strong>Community Health Update</strong>
              <span>2024-03-10</span>
            </div>
            <h5>New Reporting Guidelines</h5>
            <p>
              Updated reporting guidelines have been issued. Your cooperation is
              vital for community well-being.
            </p>
          </div>

          <div className="announcement-card">
            <div className="card-header">
              <strong>Booster Shot Availability</strong>
              <span>2024-03-08</span>
            </div>
            <h5>Expanded</h5>
            <p>
              Booster shots are now available with expanded eligibility
              criteria.
            </p>
          </div>

          <div className="announcement-card">
            <div className="card-header">
              <strong>Winter Health Advisory</strong>
              <span>2024-03-05</span>
            </div>
            <h5>Stay Warm and Safe</h5>
            <p>
              Take precautions against seasonal illnesses and support immunity.
            </p>
          </div>

          <div className="announcement-card">
            <div className="card-header">
              <strong>Upcoming Health Workshop</strong>
              <span>2024-03-01</span>
            </div>
            <h5>Stress Management</h5>
            <p>Registration is now open through the community portal.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Announcements;
