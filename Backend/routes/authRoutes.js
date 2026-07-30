import express from "express";
import {
  getMe,
  getGoogleLoginConfig,
  googleLogin,
  listSessions,
  login,
  logout,
  register,
  revokeOtherSessions,
  revokeSessionById,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { googleLoginSchema, loginSchema, profileUpdateSchema, registerSchema } from "../validation/schemas.js";

const router = express.Router();

router.post("/register", validateRequest({ body: registerSchema }), register);
router.post("/login", validateRequest({ body: loginSchema }), login);
router.get("/google/config", getGoogleLoginConfig);
router.post("/google", validateRequest({ body: googleLoginSchema }), googleLogin);
router.get("/me", protect, getMe);
router.get("/profile", protect, getMe);
router.put("/profile", protect, validateRequest({ body: profileUpdateSchema }), updateProfile);
router.post("/logout", protect, logout);
router.get("/sessions", protect, listSessions);
router.delete("/sessions/others", protect, revokeOtherSessions);
router.delete("/sessions/:sessionId", protect, revokeSessionById);

export default router;
