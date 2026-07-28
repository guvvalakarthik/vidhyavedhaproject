import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaBell, FaCheckCircle, FaTimesCircle, FaHourglass, FaClock, FaCheckDouble } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.js";
import api from "../services/api.js";
import "./NotificationBell.css";

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        setNotifications(data.notifications.slice(0, 5));
        setUnreadCount(data.unreadCount);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
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

  if (!user) return null;

  const statusIcons = {
    approved: <FaCheckCircle style={{ color: "#059669" }} />,
    rejected: <FaTimesCircle style={{ color: "#dc2626" }} />,
    "under-review": <FaHourglass style={{ color: "#2563eb" }} />,
    pending: <FaClock style={{ color: "#d97706" }} />,
  };

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <button className="notification-bell-btn" onClick={() => setOpen(!open)}>
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={handleMarkAllRead}>
                <FaCheckDouble /> Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">
              <FaBell className="empty-bell-icon" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <>
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notification-item ${n.read ? "read" : "unread"}`}
                  onClick={() => !n.read && handleMarkRead(n._id)}
                >
                  <div className="notification-item-icon">
                    {statusIcons[n.newStatus] || <FaBell />}
                  </div>
                  <div className="notification-item-content">
                    <p className="notification-item-msg">{n.message}</p>
                    <span className="notification-item-time">
                      {new Date(n.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {!n.read && <div className="unread-dot"></div>}
                </div>
              ))}
              <Link to="/notifications" className="view-all-link" onClick={() => setOpen(false)}>
                View all notifications
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
