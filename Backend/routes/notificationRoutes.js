import express from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.patch("/:notificationId/read", protect, markAsRead);
router.patch("/read-all", protect, markAllAsRead);

export default router;
