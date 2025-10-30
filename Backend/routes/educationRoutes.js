import express from "express";
import {
  submitEducationForm,
  getAllEducationApplications,
} from "../controllers/educationController.js";

const router = express.Router();

router.post("/submit", submitEducationForm);
router.get("/", getAllEducationApplications); // GET all education entries

export default router;
