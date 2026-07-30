import React, { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaFileAlt,
  FaLock,
  FaSave,
  FaTimesCircle,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import "./Profile.css";

const emptyPassword = { currentPassword: "", newPassword: "", confirmPassword: "" };

function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", currentPassword: "" });
  const [passwordForm, setPasswordForm] = useState(emptyPassword);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("info");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || "", email: user.email || "", currentPassword: "" });
  }, [user]);

  useEffect(() => {
    let active = true;
    api.get("/my-applications")
      .then(({ data }) => { if (active) setApplications(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setMessage({ type: "error", text: "Application history could not be loaded." }); });
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(({ status }) => ["pending", "under-review"].includes(status)).length,
    approved: applications.filter(({ status }) => status === "approved").length,
    rejected: applications.filter(({ status }) => status === "rejected").length,
  }), [applications]);

  const selectTab = (tab) => {
    setActiveTab(tab);
    setMessage({ type: "", text: "" });
  };

  const handleInfoSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    const normalizedEmail = form.email.trim().toLowerCase();
    const emailChanged = normalizedEmail !== user.email;
    if (emailChanged && !form.currentPassword) {
      setMessage({ type: "error", text: "Enter your current password to change your email." });
      return;
    }

    const changes = { name: form.name.trim() };
    if (emailChanged) {
      changes.email = normalizedEmail;
      changes.currentPassword = form.currentPassword;
    }

    setSaving(true);
    try {
      await updateProfile(changes);
      setForm((current) => ({ ...current, currentPassword: "" }));
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.error || "Profile could not be updated." });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must contain at least 8 characters." });
      return;
    }

    setSaving(true);
    try {
      await updateProfile(passwordForm);
      setPasswordForm(emptyPassword);
      setMessage({ type: "success", text: "Password changed and other sessions were signed out." });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.error || "Password could not be changed." });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="profile-loading"><p>Loading profile...</p></div>;

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <header className="profile-header">
        <div className="profile-avatar-large" aria-hidden="true"><FaUser /></div>
        <div>
          <h1 id="profile-title">{user.name}</h1>
          <p>{user.email}</p>
          {user.createdAt && (
            <p className="profile-joined">
              <FaCalendarAlt aria-hidden="true" /> Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </header>

      <div className="profile-stats" aria-label="Application summary">
        <div className="profile-stat-card"><FaFileAlt className="profile-stat-icon blue" /><div><span className="profile-stat-num">{stats.total}</span><span className="profile-stat-label">Total</span></div></div>
        <div className="profile-stat-card"><FaClock className="profile-stat-icon amber" /><div><span className="profile-stat-num">{stats.pending}</span><span className="profile-stat-label">In progress</span></div></div>
        <div className="profile-stat-card"><FaCheckCircle className="profile-stat-icon green" /><div><span className="profile-stat-num">{stats.approved}</span><span className="profile-stat-label">Approved</span></div></div>
        <div className="profile-stat-card"><FaTimesCircle className="profile-stat-icon red" /><div><span className="profile-stat-num">{stats.rejected}</span><span className="profile-stat-label">Rejected</span></div></div>
      </div>

      <div className="profile-tabs" role="tablist" aria-label="Profile sections">
        <button type="button" role="tab" aria-selected={activeTab === "info"} className={`profile-tab ${activeTab === "info" ? "active" : ""}`} onClick={() => selectTab("info")}><FaUser /> Personal info</button>
        <button type="button" role="tab" aria-selected={activeTab === "password"} className={`profile-tab ${activeTab === "password" ? "active" : ""}`} onClick={() => selectTab("password")}><FaLock /> Password</button>
        <button type="button" role="tab" aria-selected={activeTab === "history"} className={`profile-tab ${activeTab === "history" ? "active" : ""}`} onClick={() => selectTab("history")}><FaFileAlt /> Application history</button>
      </div>

      {message.text && <div className={message.type === "error" ? "profile-error" : "profile-success"} role={message.type === "error" ? "alert" : "status"}>{message.text}</div>}

      {activeTab === "info" && (
        <form className="profile-form" onSubmit={handleInfoSubmit}>
          <div className="profile-field"><label htmlFor="profile-name"><FaUser /> Full name</label><input id="profile-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" required /></div>
          <div className="profile-field"><label htmlFor="profile-email"><FaEnvelope /> Email address</label><input id="profile-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required /></div>
          {form.email.trim().toLowerCase() !== user.email && (
            <div className="profile-field"><label htmlFor="profile-current-password"><FaLock /> Current password</label><input id="profile-current-password" type="password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} autoComplete="current-password" required /><small>Required to protect an email change.</small></div>
          )}
          <button type="submit" className="profile-save-btn" disabled={saving}><FaSave /> {saving ? "Saving..." : "Save changes"}</button>
        </form>
      )}

      {activeTab === "password" && (
        <form className="profile-form" onSubmit={handlePasswordSubmit}>
          <div className="profile-field"><label htmlFor="current-password"><FaLock /> Current password</label><input id="current-password" type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} autoComplete="current-password" required /></div>
          <div className="profile-field"><label htmlFor="new-password"><FaLock /> New password</label><input id="new-password" type="password" minLength="8" maxLength="128" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} autoComplete="new-password" required /></div>
          <div className="profile-field"><label htmlFor="confirm-password"><FaLock /> Confirm new password</label><input id="confirm-password" type="password" minLength="8" maxLength="128" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} autoComplete="new-password" required /></div>
          <button type="submit" className="profile-save-btn" disabled={saving}><FaSave /> {saving ? "Changing..." : "Change password"}</button>
        </form>
      )}

      {activeTab === "history" && (
        <div className="profile-history">
          {applications.length === 0 ? <div className="profile-empty"><FaFileAlt className="empty-icon" /><h2>No applications yet</h2><p>Your submitted applications will appear here.</p></div> : (
            <div className="profile-history-list">{applications.map((application) => (
              <article className="history-item" key={application.applicationId}>
                <div className="history-item-left"><span className="history-app-id">{application.applicationId}</span><span className="history-category">{application.category}</span><span className="history-service">{application.serviceType}</span></div>
                <div className="history-item-right"><span className="history-date">{new Date(application.createdAt).toLocaleDateString("en-IN")}</span><span className={`history-status history-status-${application.status}`}>{application.status.replace("-", " ").toUpperCase()}</span></div>
              </article>
            ))}</div>
          )}
        </div>
      )}
    </section>
  );
}

export default Profile;
