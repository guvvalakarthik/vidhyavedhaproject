import Application from "../models/Application.js";
import { createNotification } from "./notificationController.js";

const isOwner = (application, user) =>
  application.userId?.toString() === user.userId ||
  (!application.userId && application.email === user.email);

const canAccess = (application, user) => user.role === "admin" || isOwner(application, user);

export const submitApplication = async (req, res) => {
  try {
    const { category } = req.params;
    const { name, phone, serviceType, email, ...details } = req.body;
    const application = await Application.create({
      userId: req.user?.userId || null,
      category,
      serviceType,
      name,
      email: req.user?.email || email,
      phone,
      details,
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      applicationId: application.applicationId,
      application,
    });
  } catch (err) {
    console.error("Submit application error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getApplicationsByCategory = async (req, res) => {
  const applications = await Application.find({ category: req.params.category }).sort({ createdAt: -1 });
  return res.json(applications);
};

export const getApplicationStatus = async (req, res) => {
  const application = await Application.findOne({ applicationId: req.params.applicationId });
  if (!application) return res.status(404).json({ error: "Application not found." });
  if (!canAccess(application, req.user)) {
    return res.status(403).json({ error: "You do not have access to this application." });
  }

  return res.json({
    applicationId: application.applicationId,
    category: application.category,
    serviceType: application.serviceType,
    status: application.status,
    submittedAt: application.createdAt,
  });
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findOne({ applicationId: req.params.applicationId });
    if (!application) return res.status(404).json({ error: "Application not found." });

    const oldStatus = application.status;
    application.status = req.body.status;
    await application.save();

    if (application.userId && oldStatus !== application.status) {
      await createNotification(
        application.userId,
        application.applicationId,
        application.category,
        application.serviceType,
        oldStatus,
        application.status,
      );
    }

    return res.json({ message: "Status updated successfully", application });
  } catch (err) {
    console.error("Update status error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getAllApplications = async (req, res) => {
  const applications = await Application.find().sort({ createdAt: -1 });
  return res.json(applications);
};

export const getMyApplications = async (req, res) => {
  const applications = await Application.find({
    $or: [{ userId: req.user.userId }, { userId: null, email: req.user.email }],
  }).sort({ createdAt: -1 });
  return res.json(applications);
};

export const editApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ applicationId: req.params.applicationId });
    if (!application) return res.status(404).json({ error: "Application not found." });
    if (!canAccess(application, req.user)) {
      return res.status(403).json({ error: "Not authorized to edit this application." });
    }
    if (application.status !== "pending") {
      return res.status(409).json({ error: "Only pending applications can be edited." });
    }

    const { name, phone, serviceType, email, ...details } = req.body;
    if (name) application.name = name;
    if (phone) application.phone = phone;
    if (serviceType) application.serviceType = serviceType;
    application.details = { ...(application.details || {}), ...details };
    application.markModified("details");
    await application.save();
    return res.json({ message: "Application updated successfully", application });
  } catch (err) {
    console.error("Edit application error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ applicationId: req.params.applicationId });
    if (!application) return res.status(404).json({ error: "Application not found." });
    if (!canAccess(application, req.user)) {
      return res.status(403).json({ error: "Not authorized to cancel this application." });
    }
    if (application.status === "approved") {
      return res.status(409).json({ error: "Approved applications cannot be cancelled." });
    }

    await Application.deleteOne({ _id: application._id });
    return res.json({ message: "Application cancelled successfully" });
  } catch (err) {
    console.error("Delete application error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};