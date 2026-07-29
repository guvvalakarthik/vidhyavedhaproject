import express from "express";
import {
  getMe,
  listSessions,
  login,
  logout,
  register,
  revokeOtherSessions,
  revokeSessionById,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { loginSchema, registerSchema } from "../validation/schemas.js";

const router = express.Router();

router.post("/register", validateRequest({ body: registerSchema }), register);
router.post("/login", validateRequest({ body: loginSchema }), login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.get("/sessions", protect, listSessions);
router.delete("/sessions/others", protect, revokeOtherSessions);
router.delete("/sessions/:sessionId", protect, revokeSessionById);

export default router;
