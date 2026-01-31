import { useState } from 'react';
import './UserProfile.css'
import DailyHealthLog from './DailyHealthLog';
import HealthHistory from './HealthHistory';
import CommunityDashboard from './CommunityDashboard';

function UserProfile() {
  const [page, setPage] = useState('profile');

  let content;
  if (page === 'profile') {
    content = (
      <div className="profile-card">
        <h3>Profile Details</h3>

        <div className="form-group">
          <label>Name</label>
          <input type="text" placeholder="Enter your name" />
        </div>

        <div className="form-group">
          <label>Age</label>
          <input type="number" placeholder="Enter your age" />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select defaultValue="">
            <option value="" disabled>
              Select gender
            </option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Health Conditions</label>
          <textarea
            rows="3"
            placeholder="Enter health conditions (if any)"
          />
        </div>

        <button className="save-btn">Save Profile</button>
      </div>
    );
  } else if (page === 'daily') {
    content = <DailyHealthLog />;
  } else if (page === 'history') {
    content = <HealthHistory />;
  } else if (page === 'community') {
    content = <CommunityDashboard />;
  }

  return (
    <div className="profile-page">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Community Health</h2>

        <ul className="nav-links">
          <li className={page === 'profile' ? 'active' : ''} onClick={() => setPage('profile')}>Profile</li>
          <li className={page === 'daily' ? 'active' : ''} onClick={() => setPage('daily')}>Daily Health Log</li>
          <li className={page === 'history' ? 'active' : ''} onClick={() => setPage('history')}>Health History</li>
          <li className={page === 'community' ? 'active' : ''} onClick={() => setPage('community')}>Community Dashboard</li>
        </ul>
      </aside>

      {/* Main content */}
      <div className="main-area">

        {/* Top bar */}
        <header className="topbar">
          <span className="menu-icon">☰</span>

          <div className="topbar-right">
            <span className="notification">🔔 Notifications</span>
            <button className="logout-btn">Logout</button>
            <div className="avatar">U</div>
          </div>
        </header>

        {content}

      </div>
    </div>
  )
}

export default UserProfile