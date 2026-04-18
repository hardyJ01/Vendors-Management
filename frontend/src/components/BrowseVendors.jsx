import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { get_all_vendors, add_vendor } from "../services/api/vendors";

export function BrowseVendors() {
  const [nameQuery, setNameQuery] = useState("");
  const [businessQuery, setBusinessQuery] = useState("");
  const [vendors, setVendors] = useState([]);
  const [searched, setSearched] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());
  const navigate = useNavigate();

  function handleSearch() {
    try {
      const data = get_all_vendors(nameQuery, businessQuery);
      setVendors(data);
      setSearched(true);
    } catch (e) {
      console.error(e);
    }
  }

  function handleAdd(vendor_id) {
    try {
      const result = add_vendor(vendor_id);
      if (result.status == 201 || result.status == 200) {
        setAddedIds((prev) => new Set([...prev, vendor_id]));
      }
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

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div>
      <button className="back-btn fade-in" onClick={() => navigate("/vendors")}>
        ← Back to My Vendors
      </button>

      <div className="page-header fade-in">
        <h1>Browse Vendors</h1>
        <p>Search and add new vendors to your network</p>
      </div>

      <div className="search-bar fade-in">
        <input
          className="input"
          type="text"
          placeholder="Search by name..."
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          className="input"
          type="text"
          placeholder="Search by business..."
          value={businessQuery}
          onChange={(e) => setBusinessQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      {!searched ? (
        <div className="glass-card empty-state fade-in">

          <h3>Search for Vendors</h3>
          <p>Enter a name or business type to find vendors.</p>
        </div>
      ) : vendors.length === 0 ? (
        <div className="glass-card empty-state fade-in">

          <h3>No Results Found</h3>
          <p>Try different search terms.</p>
        </div>
      ) : (
        <div className="vendor-grid fade-in">
          {vendors.map((vendor, i) => (
            <div key={i} className="glass-card vendor-card" style={{ cursor: "default" }}>
              <div className="vendor-avatar">
                {vendor.name.charAt(0).toUpperCase()}
              </div>
              <div className="vendor-name">{vendor.name}</div>
              <div className="vendor-business">{vendor.business || "—"}</div>
              <div className="vendor-meta" style={{ marginBottom: 16 }}>
                <span>{renderStars(vendor.rating)}</span>
              </div>
              {addedIds.has(vendor.vendor_id) ? (
                <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.6 }}>
                  Added
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(vendor.vendor_id);
                  }}
                >
                  + Add Vendor
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
