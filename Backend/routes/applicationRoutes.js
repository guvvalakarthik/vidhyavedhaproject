import express from "express";
import {
  deleteApplication,
  editApplication,
  getAllApplications,
  getApplicationStatus,
  getApplicationsByCategory,
  getMyApplications,
  submitApplication,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  applicationIdParamsSchema,
  applicationSchema,
  applicationUpdateSchema,
  categoryParamsSchema,
  statusUpdateSchema,
} from "../validation/schemas.js";

const router = express.Router();
const asContact = (req, _res, next) => {
  req.params.category = "contact";
  next();
};

router.post(
  "/contact/submit",
  asContact,
  validateRequest({ body: applicationSchema }),
  submitApplication,
);
router.get("/my-applications", protect, getMyApplications);
router.get("/", protect, authorize("admin"), getAllApplications);
router.get(
  "/status/:applicationId",
  protect,
  validateRequest({ params: applicationIdParamsSchema }),
  getApplicationStatus,
);
router.patch(
  "/status/:applicationId",
  protect,
  authorize("admin"),
  validateRequest({ params: applicationIdParamsSchema, body: statusUpdateSchema }),
  updateApplicationStatus,
);
router.put(
  "/edit/:applicationId",
  protect,
  validateRequest({ params: applicationIdParamsSchema, body: applicationUpdateSchema }),
  editApplication,
);
router.delete(
  "/cancel/:applicationId",
  protect,
  validateRequest({ params: applicationIdParamsSchema }),
  deleteApplication,
);
router.post(
  "/:category/submit",
  protect,
  validateRequest({ params: categoryParamsSchema, body: applicationSchema }),
  submitApplication,
);
router.get(
  "/:category",
  protect,
  authorize("admin"),
  validateRequest({ params: categoryParamsSchema }),
  getApplicationsByCategory,
);

export default router;