import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglass, FaPlus, FaUser, FaEdit, FaTrashAlt, FaSave, FaTimes, FaCalendarAlt, FaStream } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import "./UserDashboard.css";

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("cards");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", serviceType: "" });
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

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
      const { data } = await api.get("/my-applications");
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (app) => {
    setEditingId(app.applicationId);
    setEditForm({ name: app.name, phone: app.phone, serviceType: app.serviceType });
    setActionError("");
    setActionSuccess("");
  };

  const handleEditSave = async (applicationId) => {
    setActionError("");
    setActionSuccess("");
    try {
      await api.put(`/edit/${applicationId}`, editForm);
      setApplications((prev) =>
        prev.map((a) =>
          a.applicationId === applicationId ? { ...a, ...editForm } : a
        )
      );
      setEditingId(null);
      setActionSuccess("Application updated successfully!");
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err) {
      setActionError(err.response?.data?.error || "Failed to update.");
    }
  };

  const handleCancelApp = async (applicationId) => {
    if (!window.confirm("Are you sure you want to cancel this application?")) return;
    setActionError("");
    setActionSuccess("");
    try {
      await api.delete(`/cancel/${applicationId}`);
      setApplications((prev) => prev.filter((a) => a.applicationId !== applicationId));
      setActionSuccess("Application cancelled successfully!");
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err) {
      setActionError(err.response?.data?.error || "Failed to cancel.");
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    underReview: applications.filter((a) => a.status === "under-review").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const filteredApps = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const statusColors = {
    pending: { bg: "#fef3c7", text: "#92400e", icon: <FaClock /> },
    "under-review": { bg: "#dbeafe", text: "#1e40af", icon: <FaHourglass /> },
    approved: { bg: "#d1fae5", text: "#065f46", icon: <FaCheckCircle /> },
    rejected: { bg: "#fee2e2", text: "#991b1b", icon: <FaTimesCircle /> },
  };

  if (authLoading || loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <div className="dashboard-avatar"><FaUser /></div>
          <div>
            <h1>Welcome back, {user?.name}</h1>
            <p>{user?.email}</p>
          </div>
        </div>
        <Link to="/services/banking" className="new-application-btn">
          <FaPlus /> New Application
        </Link>
      </div>

      {actionError && <div className="dashboard-action-error">{actionError}</div>}
      {actionSuccess && <div className="dashboard-action-success">{actionSuccess}</div>}

      <div className="dashboard-stats">
        <div className="stat-card"><div className="stat-icon total"><FaFileAlt /></div><div className="stat-info"><span className="stat-num">{stats.total}</span><span className="stat-text">Total</span></div></div>
        <div className="stat-card"><div className="stat-icon pending"><FaClock /></div><div className="stat-info"><span className="stat-num">{stats.pending}</span><span className="stat-text">Pending</span></div></div>
        <div className="stat-card"><div className="stat-icon review"><FaHourglass /></div><div className="stat-info"><span className="stat-num">{stats.underReview}</span><span className="stat-text">Under Review</span></div></div>
        <div className="stat-card"><div className="stat-icon approved"><FaCheckCircle /></div><div className="stat-info"><span className="stat-num">{stats.approved}</span><span className="stat-text">Approved</span></div></div>
        <div className="stat-card"><div className="stat-icon rejected"><FaTimesCircle /></div><div className="stat-info"><span className="stat-num">{stats.rejected}</span><span className="stat-text">Rejected</span></div></div>
      </div>

      <div className="dashboard-controls">
        <div className="dashboard-filters">
          {["all", "pending", "under-review", "approved", "rejected"].map((f) => (
            <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f === "under-review" ? "Under Review" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="view-toggle">
          <button className={`view-btn ${viewMode === "cards" ? "active" : ""}`} onClick={() => setViewMode("cards")} title="Card view"><FaFileAlt /></button>
          <button className={`view-btn ${viewMode === "timeline" ? "active" : ""}`} onClick={() => setViewMode("timeline")} title="Timeline view"><FaStream /></button>
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="empty-state">
          <FaFileAlt className="empty-icon" />
          <h3>No applications yet</h3>
          <p>Submit your first application to get started.</p>
          <Link to="/services/banking" className="new-application-btn"><FaPlus /> Browse Services</Link>
        </div>
      ) : viewMode === "cards" ? (
        <div className="applications-list">
          {filteredApps.map((app) => {
            const sc = statusColors[app.status] || statusColors.pending;
            const isEditing = editingId === app.applicationId;
            const canEdit = app.status === "pending";
            const canCancel = app.status !== "approved";
            return (
              <div className="app-card" key={app.applicationId}>
                <div className="app-card-header">
                  <div><span className="app-id">{app.applicationId}</span><span className="app-category">{app.category}</span></div>
                  <span className="app-status-badge" style={{ background: sc.bg, color: sc.text }}>{sc.icon} {app.status.toUpperCase()}</span>
                </div>
                <div className="app-card-body">
                  {isEditing ? (
                    <>
                      <div className="app-edit-field"><label>Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                      <div className="app-edit-field"><label>Phone</label><input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                      <div className="app-edit-field"><label>Service Type</label><input type="text" value={editForm.serviceType} onChange={(e) => setEditForm({ ...editForm, serviceType: e.target.value })} /></div>
                    </>
                  ) : (
                    <>
                      <div className="app-detail"><span className="detail-label">Service</span><span className="detail-value">{app.serviceType}</span></div>
                      <div className="app-detail"><span className="detail-label">Submitted</span><span className="detail-value">{new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
                      <div className="app-detail"><span className="detail-label">Contact</span><span className="detail-value">{app.phone}</span></div>
                    </>
                  )}
                </div>
                <div className="app-card-actions">
                  {isEditing ? (
                    <>
                      <button className="app-action-btn save" onClick={() => handleEditSave(app.applicationId)}><FaSave /> Save</button>
                      <button className="app-action-btn cancel-edit" onClick={() => setEditingId(null)}><FaTimes /> Cancel</button>
                    </>
                  ) : (
                    <>
                      {canEdit && <button className="app-action-btn edit" onClick={() => handleEdit(app)}><FaEdit /> Edit</button>}
                      {canCancel && <button className="app-action-btn delete" onClick={() => handleCancelApp(app.applicationId)}><FaTrashAlt /> Cancel</button>}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="timeline-view">
          {filteredApps.map((app, idx) => {
            const sc = statusColors[app.status] || statusColors.pending;
            const canEdit = app.status === "pending";
            const canCancel = app.status !== "approved";
            return (
              <div className="timeline-item" key={app.applicationId}>
                <div className="timeline-dot" style={{ background: sc.bg, color: sc.text }}>{sc.icon}</div>
                {idx < filteredApps.length - 1 && <div className="timeline-line"></div>}
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="app-id">{app.applicationId}</span>
                    <span className="app-category">{app.category}</span>
                    <span className="app-status-badge" style={{ background: sc.bg, color: sc.text }}>{app.status.toUpperCase()}</span>
                  </div>
                  <div className="timeline-body">
                    <span><FaFileAlt /> {app.serviceType}</span>
                    <span><FaCalendarAlt /> {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <div className="timeline-actions">
                    {canEdit && <button className="app-action-btn edit" onClick={() => handleEdit(app)}><FaEdit /> Edit</button>}
                    {canCancel && <button className="app-action-btn delete" onClick={() => handleCancelApp(app.applicationId)}><FaTrashAlt /> Cancel</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
