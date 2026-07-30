import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { FINANCIAL_PATHWAY_CODES } from "../data/financialPathways.js";

const planTaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  title: { type: String, required: true, maxlength: 160 },
  description: { type: String, required: true, maxlength: 500 },
  officialUrl: { type: String, maxlength: 500 },
  status: { type: String, enum: ["not-started", "completed"], default: "not-started" },
  completedAt: Date,
}, { _id: false });

const financialPlanSchema = new mongoose.Schema({
  planId: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  pathwayCode: { type: String, enum: FINANCIAL_PATHWAY_CODES, required: true },
  pathwayTitle: { type: String, required: true },
  authority: { type: String, required: true },
  officialUrl: { type: String, required: true },
  target: { type: String, trim: true, maxlength: 120, default: "" },
  planningHorizon: {
    type: String,
    enum: ["now", "within-three-months", "researching"],
    required: true,
  },
  tasks: { type: [planTaskSchema], required: true },
  status: { type: String, enum: ["active", "completed", "archived"], default: "active", index: true },
  completedAt: Date,
  archivedAt: Date,
}, { timestamps: true, optimisticConcurrency: true });

financialPlanSchema.pre("validate", function () {
  if (!this.planId) this.planId = `FIN-${randomUUID().split("-")[0].toUpperCase()}`;
});

financialPlanSchema.index({ userId: 1, createdAt: -1 });
financialPlanSchema.index({ userId: 1, status: 1 });

export default mongoose.model("FinancialPlan", financialPlanSchema);
