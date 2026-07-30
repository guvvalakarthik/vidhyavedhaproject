import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglass, FaSearch, FaFilter, FaChartBar } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import "./AdminPanel.css";

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      fetchApplications();
    }
  }, [user, authLoading, navigate]);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get("/");
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await api.patch(`/status/${applicationId}`, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) =>
          a.applicationId === applicationId ? { ...a, status: newStatus } : a
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const categories = ["education", "emergency", "banking", "healthcare", "farming", "utilities", "ecommerce", "home-maintenance", "government", "contact"];

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    underReview: applications.filter((a) => a.status === "under-review").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const categoryCounts = categories.map((cat) => ({
    category: cat,
    count: applications.filter((a) => a.category === cat).length,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      !search ||
      app.applicationId?.toLowerCase().includes(search.toLowerCase()) ||
      app.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.email?.toLowerCase().includes(search.toLowerCase()) ||
      app.serviceType?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesCategory = filterCategory === "all" || app.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const statusColors = {
    pending: { bg: "#fef3c7", text: "#92400e" },
    "under-review": { bg: "#dbeafe", text: "#1e40af" },
    approved: { bg: "#d1fae5", text: "#065f46" },
    rejected: { bg: "#fee2e2", text: "#991b1b" },
  };

  if (authLoading || loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin panel…</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage and review all submitted applications</p>
      </div>

      {/* Overview Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon total"><FaFileAlt /></div>
          <div><span className="admin-stat-num">{stats.total}</span><span className="admin-stat-label">Total</span></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon pending"><FaClock /></div>
          <div><span className="admin-stat-num">{stats.pending}</span><span className="admin-stat-label">Pending</span></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon review"><FaHourglass /></div>
          <div><span className="admin-stat-num">{stats.underReview}</span><span className="admin-stat-label">Under Review</span></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon approved"><FaCheckCircle /></div>
          <div><span className="admin-stat-num">{stats.approved}</span><span className="admin-stat-label">Approved</span></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon rejected"><FaTimesCircle /></div>
          <div><span className="admin-stat-num">{stats.rejected}</span><span className="admin-stat-label">Rejected</span></div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryCounts.length > 0 && (
        <div className="category-breakdown">
          <h3><FaChartBar /> Applications by Category</h3>
          <div className="category-bars">
            {categoryCounts.map((cat) => (
              <div className="category-bar-row" key={cat.category}>
                <span className="category-name">{cat.category}</span>
                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{ width: `${(cat.count / stats.total) * 100}%` }}
                  ></div>
                </div>
                <span className="category-count">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="admin-filters">
        <div className="admin-search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by ID, name, email, or service…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="under-review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Applications Table */}
      <div className="admin-table-wrapper">
        {filteredApps.length === 0 ? (
          <div className="admin-empty">
            <FaFileAlt className="empty-icon" />
            <h3>No applications found</h3>
            <p>Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Category</th>
                <th>Service</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => {
                const sc = statusColors[app.status] || statusColors.pending;
                return (
                  <tr key={app.applicationId}>
                    <td className="app-id-cell">{app.applicationId}</td>
                    <td><span className="cat-tag">{app.category}</span></td>
                    <td>{app.serviceType}</td>
                    <td>{app.name}</td>
                    <td>{app.phone}{app.email && <br />}<span className="email-cell">{app.email}</span></td>
                    <td>{new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td>
                      <span className="status-pill" style={{ background: sc.bg, color: sc.text }}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={app.status}
                        disabled={updatingId === app.applicationId}
                        onChange={(e) => handleStatusUpdate(app.applicationId, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="under-review">Under Review</option>
                        <option value="approved">Approve</option>
                        <option value="rejected">Reject</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
