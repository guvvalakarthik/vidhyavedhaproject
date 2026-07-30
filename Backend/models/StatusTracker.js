import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { STATUS_PROVIDER_CODES } from "../data/statusProviders.js";
const schema = new mongoose.Schema({
  trackerId: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  providerCode: { type: String, enum: STATUS_PROVIDER_CODES, required: true },
  targetId: { type: String, required: true, trim: true, maxlength: 80 },
  label: { type: String, required: true, maxlength: 160 },
  connector: { type: String, enum: ["internal", "official-api", "not-connected"], required: true },
  currentStatus: { type: String, required: true, maxlength: 80 },
  statusMessage: { type: String, maxlength: 500, default: "" },
  sourceUpdatedAt: Date, lastCheckedAt: Date,
  status: { type: String, enum: ["active", "archived"], default: "active", index: true },
  archivedAt: Date,
}, { timestamps: true, optimisticConcurrency: true });
schema.pre("validate", function createId() { if (!this.trackerId) this.trackerId = `TRK-${randomUUID().split("-")[0].toUpperCase()}`; });
schema.index({ userId: 1, createdAt: -1 });
export default mongoose.model("StatusTracker", schema);
