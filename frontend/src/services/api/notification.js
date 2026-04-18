const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Mock data
const MOCK_NOTIFICATIONS = [
  {
    vendor_id: "1",
    vendor_name: "TechParts Co.",
    message: "You owe ₹2,000 to TechParts Co.",
    link: "",
    created_at: Date.now() - 3600000,
    read: false,
  },
  {
    vendor_id: "2",
    vendor_name: "FastShip Inc.",
    message: "Payment of ₹4,500 received from FastShip Inc.",
    link: "",
    created_at: Date.now() - 86400000,
    read: false,
  },
  {
    vendor_id: "3",
    vendor_name: "PrintWorld",
    message: "New bill of ₹850 added by PrintWorld",
    link: "",
    created_at: Date.now() - 172800000,
    read: true,
  },
];

export async function fetchNotifications() {
  try {
    const res = await fetch(`${BASE_URL}/api/get_notifications`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.warn("Notifications API unavailable, using mock data:", e.message);
    return MOCK_NOTIFICATIONS;
  }
}

export async function sendNotification(vendor_id, message, link) {
  try {
    const res = await fetch(`${BASE_URL}/api/notify`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ vendor_id, message, link }),
    });
    if (!res.ok) throw new Error("Failed to send notification");
    const json = await res.json();
    return json;
  } catch (e) {
    console.warn("Notify API unavailable:", e.message);
    return { status: 201, message: "Notification sent (mock)" };
  }
}

export async function clearNotificationsAPI() {
  try {
    const res = await fetch(`${BASE_URL}/api/clear_notifications`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to clear notifications");
    const json = await res.json();
    return json;
  } catch (e) {
    console.warn("Clear notifications API unavailable:", e.message);
    return { status: 200, message: "Notifications cleared (mock)" };
  }
}

// Keep original functions for backward compatibility
export function clear_notifications() {
  return { status: 200, message: "notifcations cleared", error: "" };
}

export function get_notifications() {
  return MOCK_NOTIFICATIONS;
}