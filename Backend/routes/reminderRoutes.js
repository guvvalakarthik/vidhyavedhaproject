import express from "express";
import { createReminder, listMyReminders, scanMyDueReminders, updateReminderStatus } from "../controllers/reminderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { reminderIdParamsSchema, reminderSchema, reminderStatusSchema } from "../validation/schemas.js";

const router = express.Router();
router.use(protect);
router.get("/", listMyReminders);
router.post("/", validateRequest({ body: reminderSchema }), createReminder);
router.post("/scan-due", scanMyDueReminders);
router.patch("/:reminderId/status", validateRequest({ params: reminderIdParamsSchema, body: reminderStatusSchema }), updateReminderStatus);
export default router;
