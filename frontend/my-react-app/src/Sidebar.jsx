import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({
  variant = "admin",
  title = "Community Health",
  className = "",
}) {
  const adminLinks = [
    { to: "/admin-dashboard", label: "Admin Dashboard" },
    { to: "/individual-health-logs", label: "Individual Health Logs" },
    { to: "/announcements", label: "Announcements" },
    { to: "/hotspot-tracker", label: "Hotspot Tracker" },
  ];

  const userLinks = [
    { to: "/user-profile", label: "Profile" },
    { to: "/daily-health-log", label: "Daily Health Log" },
    { to: "/health-history", label: "Health History" },
    { to: "/community-dashboard", label: "Community Dashboard" },
  ];

  const links = variant === "admin" ? adminLinks : userLinks;

  return (
    <aside className={`sidebar-component ${className}`.trim()}>
      <h2 className="sidebar-title">{title}</h2>

      <ul className="sidebar-nav">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
