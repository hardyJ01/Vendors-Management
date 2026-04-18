const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Mock fallback data
const MOCK_DATA = {
  balance: "10000",
  pending_amount: "2000",
  owed_amount: "1000",
  spent_this_month: "5000",
  budget_remaining: "3000",
  pending_bills: {},
  owed_bills: {},
  spend_graph_data: {},
  received_graph_data: {},
};

export async function fetchDashboard() {
  try {
    const res = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard");
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.warn("Dashboard API unavailable, using mock data:", e.message);
    return MOCK_DATA;
  }
}

// Keep original function for backward compatibility
export function dashboard() {
  return MOCK_DATA;
}