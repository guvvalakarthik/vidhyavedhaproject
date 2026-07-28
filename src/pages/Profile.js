import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaSave, FaCalendarAlt, FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.js";
import api from "../services/api.js";
import "./Profile.css";

const Profile = () => {
  const { user, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      setForm({ name: user.name, email: user.email });
      fetchApplications();
    }
  }, [user, authLoading, navigate]);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get("/my-applications");
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await updateProfile({ name: form.name, email: form.email });
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile…</p>
      </div>
    );
  }

  const stats = {
    total: applications.length,
    approved: applications.filter((a) => a.status === "approved").length,
    pending: applications.filter((a) => a.status === "pending").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-large">
          <FaUser />
        </div>
        <div>
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
          {user?.createdAt && (
            <p className="profile-joined">
              <FaCalendarAlt /> Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="profile-stats">
        <div className="profile-stat-card">
          <FaFileAlt className="profile-stat-icon blue" />
          <div><span className="profile-stat-num">{stats.total}</span><span className="profile-stat-label">Total</span></div>
        </div>
        <div className="profile-stat-card">
          <FaClock className="profile-stat-icon amber" />
          <div><span className="profile-stat-num">{stats.pending}</span><span className="profile-stat-label">Pending</span></div>
        </div>
        <div className="profile-stat-card">
          <FaCheckCircle className="profile-stat-icon green" />
          <div><span className="profile-stat-num">{stats.approved}</span><span className="profile-stat-label">Approved</span></div>
        </div>
        <div className="profile-stat-card">
          <FaTimesCircle className="profile-stat-icon red" />
          <div><span className="profile-stat-num">{stats.rejected}</span><span className="profile-stat-label">Rejected</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button className={`profile-tab ${activeTab === "info" ? "active" : ""}`} onClick={() => { setActiveTab("info"); setError(""); setSuccess(""); }}>
          <FaUser /> Personal Info
        </button>
        <button className={`profile-tab ${activeTab === "password" ? "active" : ""}`} onClick={() => { setActiveTab("password"); setError(""); setSuccess(""); }}>
          <FaLock /> Change Password
        </button>
        <button className={`profile-tab ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>
          <FaFileAlt /> Application History
        </button>
      </div>

      {/* Messages */}
      {error && <div className="profile-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}

      {/* Tab Content */}
      {activeTab === "info" && (
        <form className="profile-form" onSubmit={handleInfoSubmit}>
          <div className="profile-field">
            <label><FaUser /> Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="profile-field">
            <label><FaEnvelope /> Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="profile-save-btn" disabled={loading}>
            <FaSave /> {loading ? "Saving…" : "Save Changes"}
          </button>
        </form>
      )}

      {activeTab === "password" && (
        <form className="profile-form" onSubmit={handlePasswordSubmit}>
          <div className="profile-field">
            <label><FaLock /> Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
              placeholder="Enter your current password"
            />
          </div>
          <div className="profile-field">
            <label><FaLock /> New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              placeholder="At least 6 characters"
            />
          </div>
          <div className="profile-field">
            <label><FaLock /> Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
              placeholder="Re-enter new password"
            />
          </div>
          <button type="submit" className="profile-save-btn" disabled={loading}>
            <FaSave /> {loading ? "Changing…" : "Change Password"}
          </button>
        </form>
      )}

      {activeTab === "history" && (
        <div className="profile-history">
          {applications.length === 0 ? (
            <div className="profile-empty">
              <FaFileAlt className="empty-icon" />
              <h3>No applications yet</h3>
              <p>Your submitted applications will appear here.</p>
            </div>
          ) : (
            <div className="profile-history-list">
              {applications.map((app) => (
                <div className="history-item" key={app.applicationId}>
                  <div className="history-item-left">
                    <span className="history-app-id">{app.applicationId}</span>
                    <span className="history-category">{app.category}</span>
                    <span className="history-service">{app.serviceType}</span>
                  </div>
                  <div className="history-item-right">
                    <span className="history-date">
                      {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className={`history-status history-status-${app.status}`}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
