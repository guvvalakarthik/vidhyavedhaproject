import express from "express";
import {
  submitApplication,
  getApplicationsByCategory,
  getApplicationStatus,
  updateApplicationStatus,
  getAllApplications,
  getMyApplications,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-applications", protect, getMyApplications);
router.get("/", protect, getAllApplications);
router.get("/status/:applicationId", getApplicationStatus);
router.patch("/status/:applicationId", protect, updateApplicationStatus);
router.post("/:category/submit", submitApplication);
router.get("/:category", protect, getApplicationsByCategory);

export default router;
