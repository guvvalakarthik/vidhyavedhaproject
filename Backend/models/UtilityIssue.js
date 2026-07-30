import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { UTILITY_GUIDE_CODES } from "../data/utilityGuides.js";
const taskSchema = new mongoose.Schema({ taskId: { type: String, required: true }, title: { type: String, required: true, maxlength: 180 }, description: { type: String, required: true, maxlength: 600 }, status: { type: String, enum: ["not-started", "completed"], default: "not-started" }, completedAt: Date }, { _id: false });
const utilityIssueSchema = new mongoose.Schema({
  issueId: { type: String, unique: true, index: true }, userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  guideCode: { type: String, enum: UTILITY_GUIDE_CODES, required: true }, guideTitle: { type: String, required: true }, authority: { type: String, required: true }, officialUrl: { type: String, required: true },
  providerLabel: { type: String, trim: true, maxlength: 80, default: "" }, referenceLabel: { type: String, trim: true, maxlength: 60, default: "" }, issueDate: { type: String, required: true },
  tasks: { type: [taskSchema], required: true }, status: { type: String, enum: ["tracking", "resolved", "archived"], default: "tracking", index: true }, resolvedAt: Date, archivedAt: Date,
}, { timestamps: true, optimisticConcurrency: true });
utilityIssueSchema.pre("validate", function () { if (!this.issueId) this.issueId = `UTL-${randomUUID().split("-")[0].toUpperCase()}`; });
utilityIssueSchema.index({ userId: 1, createdAt: -1 });
utilityIssueSchema.index({ userId: 1, status: 1 });
export default mongoose.model("UtilityIssue", utilityIssueSchema);
