import express from "express";
import { submitEmergencyRequest } from "../controllers/emergencyController.js";

const router = express.Router();

router.post("/submit", submitEmergencyRequest);

export default router;
