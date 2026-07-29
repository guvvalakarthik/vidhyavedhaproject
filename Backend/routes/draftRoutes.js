import express from "express";
import {
  archiveDraft,
  createDraft,
  downloadDraftPdf,
  finalizeDraft,
  getMyDraft,
  listDraftTemplates,
  listMyDrafts,
  reviseDraft,
} from "../controllers/draftController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { draftIdParamsSchema, serviceDraftSchema } from "../validation/schemas.js";

const router = express.Router();
router.use(protect);
router.get("/templates", listDraftTemplates);
router.get("/", listMyDrafts);
router.post("/", validateRequest({ body: serviceDraftSchema }), createDraft);
router.get("/:draftId", validateRequest({ params: draftIdParamsSchema }), getMyDraft);
router.put("/:draftId", validateRequest({ params: draftIdParamsSchema, body: serviceDraftSchema }), reviseDraft);
router.patch("/:draftId/finalize", validateRequest({ params: draftIdParamsSchema }), finalizeDraft);
router.patch("/:draftId/archive", validateRequest({ params: draftIdParamsSchema }), archiveDraft);
router.get("/:draftId/pdf", validateRequest({ params: draftIdParamsSchema }), downloadDraftPdf);

export default router;
