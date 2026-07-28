import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      userId: req.user.userId,
      read: false,
    });
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user.userId },
      { read: true }
    );
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, read: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createNotification = async (userId, applicationId, category, serviceType, oldStatus, newStatus) => {
  try {
    const messages = {
      approved: `Great news! Your ${serviceType} application has been approved.`,
      rejected: `Your ${serviceType} application has been rejected.`,
      "under-review": `Your ${serviceType} application is now under review.`,
      pending: `Your ${serviceType} application status has been reset to pending.`,
    };
    await Notification.create({
      userId,
      applicationId,
      category,
      serviceType,
      oldStatus,
      newStatus,
      message: messages[newStatus] || `Your ${serviceType} application status changed to ${newStatus}.`,
    });
  } catch (err) {
    console.error("Create notification error:", err);
  }
};
