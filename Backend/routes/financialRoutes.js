import express from "express";
import {
  archiveFinancialPlan,
  createFinancialPlan,
  getFinancialPathway,
  listFinancialPathways,
  listMyFinancialPlans,
  updateFinancialTask,
} from "../controllers/financialController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  financialPathwayParamsSchema,
  financialPlanParamsSchema,
  financialPlanSchema,
  financialPlanTaskParamsSchema,
  financialTaskUpdateSchema,
} from "../validation/schemas.js";

const router = express.Router();

router.get("/pathways", listFinancialPathways);
router.get(
  "/pathways/:pathwayCode",
  validateRequest({ params: financialPathwayParamsSchema }),
  getFinancialPathway,
);
router.get("/plans/mine", protect, listMyFinancialPlans);
router.post("/plans", protect, validateRequest({ body: financialPlanSchema }), createFinancialPlan);
router.patch(
  "/plans/:planId/tasks/:taskId",
  protect,
  validateRequest({ params: financialPlanTaskParamsSchema, body: financialTaskUpdateSchema }),
  updateFinancialTask,
);
router.patch(
  "/plans/:planId/archive",
  protect,
  validateRequest({ params: financialPlanParamsSchema }),
  archiveFinancialPlan,
);

export default router;
