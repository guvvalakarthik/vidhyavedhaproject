import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { FARMING_PATHWAY_CODES, FARMING_SEASONS } from "../data/farmingPathways.js";

const taskSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  title: { type: String, required: true, maxlength: 180 },
  description: { type: String, required: true, maxlength: 600 },
  status: { type: String, enum: ["not-started", "completed"], default: "not-started" },
  completedAt: Date,
}, { _id: false });

const farmingPlanSchema = new mongoose.Schema({
  planId: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  pathwayCode: { type: String, enum: FARMING_PATHWAY_CODES, required: true },
  pathwayTitle: { type: String, required: true },
  authority: { type: String, required: true },
  officialUrl: { type: String, required: true },
  crop: { type: String, trim: true, maxlength: 80, default: "" },
  district: { type: String, trim: true, maxlength: 100, default: "" },
  season: { type: String, enum: FARMING_SEASONS, required: true },
  tasks: { type: [taskSchema], required: true },
  status: { type: String, enum: ["active", "completed", "archived"], default: "active", index: true },
  completedAt: Date,
  archivedAt: Date,
}, { timestamps: true, optimisticConcurrency: true });

farmingPlanSchema.pre("validate", function () {
  if (!this.planId) this.planId = `FRM-${randomUUID().split("-")[0].toUpperCase()}`;
});

farmingPlanSchema.index({ userId: 1, createdAt: -1 });
farmingPlanSchema.index({ userId: 1, status: 1 });

export default mongoose.model("FarmingPlan", farmingPlanSchema);
