import express from "express";
import {
  cancelGovernmentRequest,
  createGovernmentAssistanceRequest,
  getGovernmentService,
  listGovernmentServices,
  listMyGovernmentRequests,
} from "../controllers/governmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  applicationIdParamsSchema,
  governmentAssistanceSchema,
  governmentServiceParamsSchema,
} from "../validation/schemas.js";

const router = express.Router();

router.get("/services", listGovernmentServices);
router.get(
  "/services/:serviceCode",
  validateRequest({ params: governmentServiceParamsSchema }),
  getGovernmentService,
);
router.get("/requests/mine", protect, listMyGovernmentRequests);
router.post(
  "/requests",
  protect,
  validateRequest({ body: governmentAssistanceSchema }),
  createGovernmentAssistanceRequest,
);
router.delete(
  "/requests/:applicationId",
  protect,
  validateRequest({ params: applicationIdParamsSchema }),
  cancelGovernmentRequest,
);

export default router;