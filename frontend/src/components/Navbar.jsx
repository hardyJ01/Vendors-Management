import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { get_notifications, clear_notifications } from "../services/api/notification";

export function Navbar() {
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    const data = get_notifications();
    setNotifications(data);
  }, []);

  function isActive(path) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  function handleClearAll() {
    clear_notifications();
    setNotifications([]);
  }

  function handleMarkRead(index) {
    setNotifications((prev) =>
      prev.map((n, i) => (i === index ? { ...n, read: true } : n))
    );
  }

  function formatTime(timestamp) {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp));
    if (isNaN(date.getTime())) return "Just now";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="top-navbar">
      <div className="nav-brand">
        <h2>VendorFlow</h2>
      </div>

      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
          <span className="nav-icon">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </span>
          <span>Dashboard</span>
        </Link>

        <Link to="/vendors" className={`nav-link ${isActive("/vendors") ? "active" : ""}`}>
          <span className="nav-icon">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </span>
          <span>Vendors</span>
        </Link>
      </div>

      <div className="nav-right">
        <div className="notif-wrapper" ref={notifRef}>
          <button
            className="notif-bell"
            onClick={() => setShowNotifs(!showNotifs)}
            title="Notifications"
          >
            <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {showNotifs && (
            <>
              <div className="notif-overlay" onClick={() => setShowNotifs(false)} />
              <div className="notif-dropdown">
                <div className="notif-dropdown-header">
                  <h3>Notifications</h3>
                  {notifications.length > 0 && (
                    <button className="clear-btn" onClick={handleClearAll}>
                      Clear All
                    </button>
                  )}
                </div>
                <div className="notif-dropdown-body">
                  {notifications.length === 0 ? (
                    <div className="notif-dropdown-empty">
                      <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif, i) => (
                      <div
                        key={i}
                        className={`notif-dropdown-item ${!notif.read ? "unread" : ""}`}
                        onClick={() => handleMarkRead(i)}
                      >
                        <div className="notif-avatar">
                          {(notif.vendor_name || "V").charAt(0).toUpperCase()}
                        </div>
                        <div className="notif-content">
                          <div className="notif-message">{notif.message}</div>
                          <div className="notif-time">{formatTime(notif.created_at)}</div>
                        </div>
                        {!notif.read && <div className="notif-dot" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}