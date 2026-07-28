import Application from "../models/Application.js";
import { createNotification } from "./notificationController.js";

const VALID_CATEGORIES = [
  "education",
  "emergency",
  "banking",
  "healthcare",
  "farming",
  "utilities",
  "ecommerce",
  "home-maintenance",
  "government",
  "contact",
];

export const submitApplication = async (req, res) => {
  try {
    const { category } = req.params;
    const { name, phone, serviceType, ...details } = req.body;

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category: ${category}` });
    }

    if (!name || !phone || !serviceType) {
      return res.status(400).json({ error: "Name, phone, and serviceType are required." });
    }

    const application = await Application.create({
      category,
      serviceType,
      name,
      email: details.email || undefined,
      phone,
      details,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      applicationId: application.applicationId,
      application,
    });
  } catch (err) {
    console.error("Submit application error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getApplicationsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category: ${category}` });
    }

    const applications = await Application.find({ category }).sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error("Get applications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findOne({ applicationId });
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    res.json({
      applicationId: application.applicationId,
      category: application.category,
      serviceType: application.serviceType,
      status: application.status,
      submittedAt: application.createdAt,
    });
  } catch (err) {
    console.error("Get status error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "under-review", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const existing = await Application.findOne({ applicationId });
    if (!existing) {
      return res.status(404).json({ error: "Application not found." });
    }

    const oldStatus = existing.status;

    const application = await Application.findOneAndUpdate(
      { applicationId },
      { status },
      { new: true }
    );

    if (application.userId && oldStatus !== status) {
      await createNotification(
        application.userId,
        application.applicationId,
        application.category,
        application.serviceType,
        oldStatus,
        status
      );
    }

    res.json({
      message: "Status updated successfully",
      application,
    });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error("Get all applications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const applications = await Application.find({
      $or: [{ userId }, { email: req.user.email }],
    }).sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error("Get my applications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const editApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { name, phone, serviceType, ...details } = req.body;

    const application = await Application.findOne({ applicationId });
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    if (application.status !== "pending") {
      return res.status(400).json({ error: "Only pending applications can be edited." });
    }

    const userId = req.user.userId;
    const isOwner = application.userId?.toString() === userId || application.email === req.user.email;
    if (!isOwner) {
      return res.status(403).json({ error: "Not authorized to edit this application." });
    }

    if (name) application.name = name;
    if (phone) application.phone = phone;
    if (serviceType) application.serviceType = serviceType;
    application.details = { ...application.details, ...details };
    application.markModified("details");

    await application.save();

    res.json({
      message: "Application updated successfully",
      application,
    });
  } catch (err) {
    console.error("Edit application error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findOne({ applicationId });
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    const userId = req.user.userId;
    const isOwner = application.userId?.toString() === userId || application.email === req.user.email;
    if (!isOwner) {
      return res.status(403).json({ error: "Not authorized to cancel this application." });
    }

    if (application.status === "approved") {
      return res.status(400).json({ error: "Approved applications cannot be cancelled." });
    }

    await Application.deleteOne({ applicationId });

    res.json({ message: "Application cancelled successfully" });
  } catch (err) {
    console.error("Delete application error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
