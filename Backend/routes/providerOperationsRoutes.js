import express from "express";
import { dashboard } from "../controllers/providerOperationsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", protect, authorize("provider", "admin"), dashboard);
export default router;
