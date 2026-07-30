import express from "express";
import {
  assignEmergencyRequest,
  cancelEmergencyRequest,
  createEmergencyRequest,
  listDispatchQueue,
  listEmergencyServices,
  listMyEmergencyRequests,
  updateEmergencyStatus,
} from "../controllers/emergencyController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  emergencyAssignmentSchema,
  emergencyRequestIdParamsSchema,
  emergencyRequestSchema,
  emergencyStatusSchema,
} from "../validation/schemas.js";

const router = express.Router();

router.get("/services", listEmergencyServices);
router.get("/requests/mine", protect, listMyEmergencyRequests);
router.post("/requests", protect, validateRequest({ body: emergencyRequestSchema }), createEmergencyRequest);
router.patch(
  "/requests/:requestId/cancel",
  protect,
  validateRequest({ params: emergencyRequestIdParamsSchema }),
  cancelEmergencyRequest,
);
router.get("/dispatch/queue", protect, authorize("dispatcher", "admin"), listDispatchQueue);
router.patch(
  "/dispatch/:requestId/assign",
  protect,
  authorize("dispatcher", "admin"),
  validateRequest({ params: emergencyRequestIdParamsSchema, body: emergencyAssignmentSchema }),
  assignEmergencyRequest,
);
router.patch(
  "/dispatch/:requestId/status",
  protect,
  authorize("dispatcher", "admin"),
  validateRequest({ params: emergencyRequestIdParamsSchema, body: emergencyStatusSchema }),
  updateEmergencyStatus,
);

export default router;