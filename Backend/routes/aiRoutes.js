import express from "express";
import {
  askAssistant,
  cancelAction,
  confirmAction,
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  listPendingActions,
  sendConversationMessage,
} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  agentActionParamsSchema,
  aiAskSchema,
  aiConversationSchema,
  aiMessageSchema,
} from "../validation/schemas.js";

const router = express.Router();

router.use(protect);
router.post("/ask", validateRequest({ body: aiAskSchema }), askAssistant);
router.get("/conversations", listConversations);
router.post("/conversations", validateRequest({ body: aiConversationSchema }), createConversation);
router.get("/conversations/:conversationId", getConversation);
router.post(
  "/conversations/:conversationId/messages",
  validateRequest({ body: aiMessageSchema }),
  sendConversationMessage,
);
router.delete("/conversations/:conversationId", deleteConversation);
router.get("/actions/pending", listPendingActions);
router.post(
  "/actions/:actionId/confirm",
  validateRequest({ params: agentActionParamsSchema }),
  confirmAction,
);
router.post(
  "/actions/:actionId/cancel",
  validateRequest({ params: agentActionParamsSchema }),
  cancelAction,
);

export default router;
