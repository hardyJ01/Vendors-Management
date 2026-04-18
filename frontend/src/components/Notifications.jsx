import { useState, useEffect } from "react";
import { get_notifications, clear_notifications } from "../services/api/notification";

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  function fetchNotifications() {
    try {
      const data = get_notifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleClearAll() {
    try {
      clear_notifications();
      setNotifications([]);
    } catch (e) {
      console.error(e);
    }
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

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Notifications</h1>
          <p>Loading...</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="notification-header fade-in">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Notifications</h1>
          <p>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>
        {notifications.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={handleClearAll}>
            🗑️ Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card empty-state fade-in">
          <div className="empty-icon">🔔</div>
          <h3>No Notifications</h3>
          <p>When you receive notifications, they'll appear here.</p>
        </div>
      ) : (
        <div className="notification-list fade-in">
          {notifications.map((notif, i) => (
            <div
              key={i}
              className={`glass-card notification-item ${!notif.read ? "unread" : ""}`}
              onClick={() => handleMarkRead(i)}
            >
              <div className="notif-avatar">
                {(notif.vendor_name || notif.vendor_id || "V").charAt(0).toUpperCase()}
              </div>
              <div className="notif-content">
                <div className="notif-message">{notif.message}</div>
                <div className="notif-time">{formatTime(notif.crated_at || notif.created_at)}</div>
              </div>
              {!notif.read && <div className="notif-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
