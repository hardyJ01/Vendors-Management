const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Mock data
const MOCK_VENDORS = [
  {
    vendor_id: "1",
    name: "TechParts Co.",
    business: "Electronics & Components",
    profile_pic: "",
    phone_number: "9876543210",
    rating: 4.5,
    no_rating: 128,
  },
  {
    vendor_id: "2",
    name: "FastShip Inc.",
    business: "Logistics & Shipping",
    profile_pic: "",
    phone_number: "9876543211",
    rating: 4.2,
    no_rating: 94,
  },
  {
    vendor_id: "3",
    name: "PrintWorld",
    business: "Printing Services",
    profile_pic: "",
    phone_number: "9876543212",
    rating: 3.8,
    no_rating: 56,
  },
];

const MOCK_ALL_VENDORS = [
  ...MOCK_VENDORS,
  {
    vendor_id: "4",
    name: "CloudSoft Ltd.",
    business: "Software Development",
    profile_pic: "",
    phone_number: "9876543213",
    rating: 4.7,
    no_rating: 210,
  },
  {
    vendor_id: "5",
    name: "MetaDesigns",
    business: "UI/UX Design Agency",
    profile_pic: "",
    phone_number: "9876543214",
    rating: 4.0,
    no_rating: 73,
  },
];

const MOCK_VENDOR_DETAIL = {
  name: "TechParts Co.",
  business: "Electronics & Components",
  rating: 4.5,
  no_rating: 128,
  phone_number: "9876543210",
  address: "42, Industrial Area, Ahmedabad",
  email: "contact@techparts.com",
  qr_code_url: "",
};

// API functions with fetch + mock fallback
export async function fetchVendors() {
  try {
    const res = await fetch(`${BASE_URL}/api/get_vendors`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed");
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.warn("Vendors API unavailable, using mock:", e.message);
    return MOCK_VENDORS;
  }
}

export async function fetchAllVendors(name_query, business_query) {
  try {
    const params = new URLSearchParams();
    if (name_query) params.set("name_query", name_query);
    if (business_query) params.set("business_query", business_query);
    const res = await fetch(`${BASE_URL}/api/get_all_vendors?${params}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed");
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.warn("All vendors API unavailable, using mock:", e.message);
    return MOCK_ALL_VENDORS;
  }
}

export async function fetchVendor(vendor_id) {
  try {
    const res = await fetch(`${BASE_URL}/api/get_vendor/${vendor_id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed");
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.warn("Vendor detail API unavailable, using mock:", e.message);
    return MOCK_VENDOR_DETAIL;
  }
}

export async function addVendorAPI(vendor_id) {
  try {
    const res = await fetch(`${BASE_URL}/api/add_vendor`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ vendor_id }),
    });
    if (!res.ok) throw new Error("Failed");
    const json = await res.json();
    return json;
  } catch (e) {
    console.warn("Add vendor API unavailable:", e.message);
    return { status: "201", message: "vendor added (mock)", error: "" };
  }
}

export async function checkHasRated(vendor_id) {
  try {
    const res = await fetch(`${BASE_URL}/api/has_rated/${vendor_id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed");
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.warn("Has rated API unavailable:", e.message);
    return { has_rated: false };
  }
}

export async function submitRating(vendor_id, rating) {
  try {
    const res = await fetch(`${BASE_URL}/api/rate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ vendor_id, rating }),
    });
    if (!res.ok) throw new Error("Failed");
    const json = await res.json();
    return json;
  } catch (e) {
    console.warn("Rate API unavailable:", e.message);
    return { status: "201", message: "vendor rated (mock)", error: "" };
  }
}

// ── Keep original synchronous functions for backward compatibility ──
export function get_vendors(page, limit) {
  return MOCK_VENDORS;
}

export function get_all_vendors(name_query, business_query, page, limit) {
  return MOCK_ALL_VENDORS;
}

export function add_vendor(vendor_id) {
  return { status: "201", message: "vendor added", error: "" };
}

export function get_vendor(vendor_id) {
  return MOCK_VENDOR_DETAIL;
}

export function has_rated(vendor_id) {
  return { has_rated: false };
}

export function rate(vendor_id, rating) {
  return { status: "201", message: "vendor rated", error: "" };
}