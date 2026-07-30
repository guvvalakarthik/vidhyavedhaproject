import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import {
  EDUCATION_LEARNER_STAGES,
  EDUCATION_PATHWAY_CODES,
} from "../data/educationPathways.js";

const planTaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  title: { type: String, required: true, maxlength: 160 },
  description: { type: String, required: true, maxlength: 500 },
  officialUrl: { type: String, maxlength: 500 },
  status: { type: String, enum: ["not-started", "completed"], default: "not-started" },
  completedAt: Date,
}, { _id: false });

const educationPlanSchema = new mongoose.Schema({
  planId: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  pathwayCode: { type: String, enum: EDUCATION_PATHWAY_CODES, required: true },
  pathwayTitle: { type: String, required: true },
  authority: { type: String, required: true },
  officialUrl: { type: String, required: true },
  learnerStage: { type: String, enum: EDUCATION_LEARNER_STAGES, required: true },
  target: { type: String, trim: true, maxlength: 160, default: "" },
  targetCycle: { type: String, enum: ["current-cycle", "next-cycle", "exploring"], required: true },
  tasks: { type: [planTaskSchema], required: true },
  status: { type: String, enum: ["active", "completed", "archived"], default: "active", index: true },
  completedAt: Date,
  archivedAt: Date,
}, { timestamps: true, optimisticConcurrency: true });

educationPlanSchema.pre("validate", function () {
  if (!this.planId) this.planId = `EDU-${randomUUID().split("-")[0].toUpperCase()}`;
});

educationPlanSchema.index({ userId: 1, createdAt: -1 });
educationPlanSchema.index({ userId: 1, status: 1 });

export default mongoose.model("EducationPlan", educationPlanSchema);
