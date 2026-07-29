import express from "express";
import { askAssistant } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { aiAskSchema } from "../validation/schemas.js";

const router = express.Router();

router.post("/ask", protect, validateRequest({ body: aiAskSchema }), askAssistant);

export default router;
