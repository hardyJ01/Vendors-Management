import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get_vendor, has_rated, rate } from "../services/api/vendors";

export function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(null);
  const [hasRated, setHasRated] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    try {
      const vendorData = get_vendor(id);
      setVendor(vendorData);

      const ratedData = has_rated(id);
      setHasRated(ratedData.has_rated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  function handleSubmitRating() {
    if (selectedRating < 1) return;
    try {
      rate(id, selectedRating);
      setRatingSubmitted(true);
      setHasRated(true);
    } catch (e) {
      console.error(e);
    }
  }

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
      <div className="vendor-detail">
        <div className="page-header">
          <h1>Vendor Details</h1>
          <p>Loading...</p>
        </div>
        <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="vendor-detail">
        <button className="back-btn" onClick={() => navigate("/vendors")}>
          ← Back to My Vendors
        </button>
        <div className="glass-card empty-state">

          <h3>Vendor Not Found</h3>
          <p>The vendor you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-detail">
      <button className="back-btn fade-in" onClick={() => navigate("/vendors")}>
        ← Back to My Vendors
      </button>

      {/* Hero Section */}
      <div className="vendor-hero fade-in">
        <div className="vendor-hero-avatar">
          {vendor.name.charAt(0).toUpperCase()}
        </div>
        <div className="vendor-hero-info">
          <h2>{vendor.name}</h2>
          <p>{vendor.business || "No business listed"}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            {renderStars(vendor.rating)}
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              {vendor.rating}/5 ({vendor.no_rating} rating{vendor.no_rating !== 1 ? "s" : ""})
            </span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="vendor-info-grid fade-in">
        <div className="glass-card vendor-info-item">
          <div className="info-label">Email</div>
          <div className="info-value">{vendor.email || "—"}</div>
        </div>
        <div className="glass-card vendor-info-item">
          <div className="info-label">Phone</div>
          <div className="info-value">{vendor.phone_number || "—"}</div>
        </div>
        <div className="glass-card vendor-info-item">
          <div className="info-label">Address</div>
          <div className="info-value">{vendor.address || "—"}</div>
        </div>
        <div className="glass-card vendor-info-item">
          <div className="info-label">Business</div>
          <div className="info-value">{vendor.business || "—"}</div>
        </div>
      </div>

      {/* Rating Widget */}
      {!hasRated && !ratingSubmitted ? (
        <div className="glass-card rating-widget fade-in">
          <h3>Rate this Vendor</h3>
          <div className="star-picker">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star-btn ${star <= (hoverRating || selectedRating) ? "active" : ""}`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setSelectedRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSubmitRating}
            disabled={selectedRating < 1}
            style={{ opacity: selectedRating < 1 ? 0.5 : 1 }}
          >
            Submit Rating
          </button>
        </div>
      ) : (
        <div className="glass-card rating-widget fade-in">
          <h3>You've already rated this vendor</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {ratingSubmitted ? "Thank you for your feedback!" : "You can update your rating later."}
          </p>
        </div>
      )}
    </div>
  );
}
