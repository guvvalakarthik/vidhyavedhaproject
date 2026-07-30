import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

export const REMINDER_SOURCE_TYPES = ["readiness", "draft", "custom"];
export const REMINDER_CADENCES = ["once", "daily", "weekly"];

const schema = new mongoose.Schema({
  reminderId: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sourceType: { type: String, enum: REMINDER_SOURCE_TYPES, required: true },
  sourceId: { type: String, trim: true, maxlength: 20, default: "" },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  dueAt: { type: Date, required: true, index: true },
  cadence: { type: String, enum: REMINDER_CADENCES, required: true },
  channel: { type: String, enum: ["in-app"], default: "in-app" },
  status: { type: String, enum: ["active", "paused", "completed", "archived"], default: "active", index: true },
  nextRunAt: { type: Date, required: true, index: true },
  lastEvaluatedAt: Date,
  lastNotifiedAt: Date,
  completedAt: Date,
  archivedAt: Date,
}, { timestamps: true, optimisticConcurrency: true });

schema.pre("validate", function createId() {
  if (!this.reminderId) this.reminderId = `RMD-${randomUUID().split("-")[0].toUpperCase()}`;
  if (!this.nextRunAt) this.nextRunAt = this.dueAt;
});
schema.index({ status: 1, nextRunAt: 1 });
schema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Reminder", schema);
