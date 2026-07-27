import React, { useState } from "react";
import "./HomePage.css";
import bannerImage from "../assets/vidhyavedhaservicesphoto.png";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import api from "../services/api.js";

const Homepage = () => {
  const [applicationId, setApplicationId] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitStatus = async () => {
    if (!applicationId.trim()) {
      setStatusError("Please enter an Application ID.");
      return;
    }
    setLoading(true);
    setStatusError("");
    setStatusResult(null);
    try {
      const { data } = await api.get(`/status/${applicationId.trim()}`);
      setStatusResult(data);
    } catch (err) {
      setStatusError(
        err.response?.data?.error || "Application not found."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homepage-container">
      <div className="homepage-flex">
        <div className="homepage-image">
          <img src={bannerImage} alt="Vidhya Vedha Services" />
        </div>

        <div className="homepage-search">
          <h2 className="search-heading">🔍 Search</h2>

          {/* Search Location Section */}
          <div className="search-group">
            <label htmlFor="location">Search Location</label>
            <select id="location">
              <option>Kurnool</option>
              <option>Hyderabad</option>
              <option>Bangalore</option>
              <option>Mumbai</option>
              <option>Chennai</option>
              <option>Delhi</option>
              <option>Pune</option>
              <option>Ahmedabad</option>
              <option>Kolkata</option>
              <option>Jaipur</option>
            </select>
          </div>

          <button className="btn blue">
            <FaMapMarkerAlt /> Check Nearest Location
          </button>

          {/* Application Status Section */}
          <div className="search-group" style={{ marginTop: "25px" }}>
            <label htmlFor="status">Check Application Status</label>
            <input
              type="text"
              id="status"
              placeholder="Enter Application ID"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
            />
          </div>

          <button
            className="btn green"
            onClick={handleSubmitStatus}
            disabled={loading}
          >
            <FaSearch /> {loading ? "Checking…" : "Submit"}
          </button>

          {statusError && (
            <p
              className="status-error"
              style={{
                color: "#e53e3e",
                marginTop: "12px",
                fontSize: "14px",
              }}
            >
              {statusError}
            </p>
          )}

          {statusResult && (
            <div
              className="status-result"
              style={{
                marginTop: "12px",
                padding: "12px",
                borderRadius: "8px",
                background: "#f0fff4",
                border: "1px solid #c6f6d5",
                fontSize: "14px",
              }}
            >
              <p>
                <strong>Application ID:</strong> {statusResult.applicationId}
              </p>
              <p>
                <strong>Service:</strong> {statusResult.serviceType}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color:
                      statusResult.status === "approved"
                        ? "#2f855a"
                        : statusResult.status === "rejected"
                        ? "#c53030"
                        : statusResult.status === "under-review"
                        ? "#d69e2e"
                        : "#4a5568",
                  }}
                >
                  {statusResult.status.toUpperCase()}
                </span>
              </p>
              <p>
                <strong>Submitted:</strong>{" "}
                {new Date(statusResult.submittedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
