import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { get_vendors } from "../services/api/vendors";

export function MyVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const data = get_vendors();
      setVendors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  function renderStars(rating) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(rating) ? "" : "star-empty"}>
          ★
        </span>
      );
    }
    return <div className="stars">{stars}</div>;
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>My Vendors</h1>
          <p>Loading...</p>
        </div>
        <div className="vendor-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header fade-in">
        <h1>My Vendors</h1>
        <p>Vendors you work with</p>
      </div>

      <div style={{ marginBottom: 24 }} className="fade-in">
        <button className="btn btn-primary" onClick={() => navigate("/vendors/browse")}>
          + Browse & Add Vendors
        </button>
      </div>

      {vendors.length === 0 ? (
        <div className="glass-card empty-state fade-in">

          <h3>No Vendors Yet</h3>
          <p>Browse vendors and add them to your list.</p>
        </div>
      ) : (
        <div className="vendor-grid fade-in">
          {vendors.map((vendor, i) => (
            <div
              key={i}
              className="glass-card vendor-card"
              onClick={() => navigate(`/vendors/${vendor.vendor_id}`)}
            >
              <div className="vendor-avatar">
                {vendor.name.charAt(0).toUpperCase()}
              </div>
              <div className="vendor-name">{vendor.name}</div>
              <div className="vendor-business">{vendor.business || "—"}</div>
              <div className="vendor-meta">
                <span>{renderStars(vendor.rating)}</span>
                <span>{vendor.phone_number || "N/A"}</span>
              </div>
              <div className="vendor-meta" style={{ marginTop: 8 }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                  {vendor.no_rating} rating{vendor.no_rating !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
