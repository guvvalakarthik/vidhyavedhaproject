import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaCheckCircle, FaTimesCircle, FaHourglass, FaClock, FaCheckDouble, FaFileAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.js";
import api from "../services/api.js";
import "./Notifications.css";

const Notifications = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      fetchNotifications();
    }
  }, [user, authLoading, navigate]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="notifications-loading">
        <div className="spinner"></div>
        <p>Loading notifications…</p>
      </div>
    );
  }

  const statusIcons = {
    approved: { icon: <FaCheckCircle />, color: "#059669", bg: "#d1fae5" },
    rejected: { icon: <FaTimesCircle />, color: "#dc2626", bg: "#fee2e2" },
    "under-review": { icon: <FaHourglass />, color: "#2563eb", bg: "#dbeafe" },
    pending: { icon: <FaClock />, color: "#d97706", bg: "#fef3c7" },
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1><FaBell /> Notifications</h1>
          <p>{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up!"}</p>
        </div>
        {unreadCount > 0 && (
          <button className="mark-all-btn-page" onClick={handleMarkAllRead}>
            <FaCheckDouble /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="notifications-empty">
          <FaBell className="empty-bell" />
          <h3>No notifications yet</h3>
          <p>You'll be notified here when your application statuses change.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((n) => {
            const sc = statusIcons[n.newStatus] || { icon: <FaBell />, color: "#64748b", bg: "#f1f5f9" };
            return (
              <div
                key={n._id}
                className={`notification-card ${n.read ? "read" : "unread"}`}
                onClick={() => !n.read && handleMarkRead(n._id)}
              >
                <div className="notification-card-icon" style={{ background: sc.bg, color: sc.color }}>
                  {sc.icon}
                </div>
                <div className="notification-card-body">
                  <p className="notification-card-msg">{n.message}</p>
                  <div className="notification-card-meta">
                    <span className="notification-card-app">
                      <FaFileAlt /> {n.applicationId}
                    </span>
                    <span className="notification-card-category">{n.category}</span>
                    <span className="notification-card-time">
                      {new Date(n.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                {!n.read && <div className="unread-indicator"></div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
