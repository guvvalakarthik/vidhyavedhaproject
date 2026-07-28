import express from "express";
import {
  archiveEducationPlan,
  createEducationPlan,
  getEducationPathway,
  listEducationPathways,
  listMyEducationPlans,
  updateEducationTask,
} from "../controllers/educationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  educationPathwayParamsSchema,
  educationPlanParamsSchema,
  educationPlanSchema,
  educationPlanTaskParamsSchema,
  educationTaskUpdateSchema,
} from "../validation/schemas.js";

const router = express.Router();

router.get("/pathways", listEducationPathways);
router.get(
  "/pathways/:pathwayCode",
  validateRequest({ params: educationPathwayParamsSchema }),
  getEducationPathway,
);
router.get("/plans/mine", protect, listMyEducationPlans);
router.post("/plans", protect, validateRequest({ body: educationPlanSchema }), createEducationPlan);
router.patch(
  "/plans/:planId/tasks/:taskId",
  protect,
  validateRequest({ params: educationPlanTaskParamsSchema, body: educationTaskUpdateSchema }),
  updateEducationTask,
);
router.patch(
  "/plans/:planId/archive",
  protect,
  validateRequest({ params: educationPlanParamsSchema }),
  archiveEducationPlan,
);

export default router;
