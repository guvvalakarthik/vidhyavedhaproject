import express from "express";
import {
  archiveFarmingPlan,
  createFarmingPlan,
  getFarmingPathway,
  listFarmingPathways,
  listMyFarmingPlans,
  updateFarmingTask,
} from "../controllers/farmingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  farmingPathwayParamsSchema,
  farmingPlanParamsSchema,
  farmingPlanSchema,
  farmingPlanTaskParamsSchema,
  farmingTaskUpdateSchema,
} from "../validation/schemas.js";

const router = express.Router();
router.get("/pathways", listFarmingPathways);
router.get("/pathways/:pathwayCode", validateRequest({ params: farmingPathwayParamsSchema }), getFarmingPathway);
router.get("/plans/mine", protect, listMyFarmingPlans);
router.post("/plans", protect, validateRequest({ body: farmingPlanSchema }), createFarmingPlan);
router.patch(
  "/plans/:planId/tasks/:taskId",
  protect,
  validateRequest({ params: farmingPlanTaskParamsSchema, body: farmingTaskUpdateSchema }),
  updateFarmingTask,
);
router.patch(
  "/plans/:planId/archive",
  protect,
  validateRequest({ params: farmingPlanParamsSchema }),
  archiveFarmingPlan,
);
export default router;
