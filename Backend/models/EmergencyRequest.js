import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { EMERGENCY_SERVICE_CODES } from "../data/emergencyServices.js";
import { EMERGENCY_STATUSES } from "../services/emergencyDispatchService.js";

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: EMERGENCY_STATUSES, required: true },
  at: { type: Date, default: Date.now, required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { _id: false });

const emergencyRequestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  serviceCode: { type: String, enum: EMERGENCY_SERVICE_CODES, required: true },
  serviceName: { type: String, required: true },
  contactPhone: { type: String, required: true, trim: true, maxlength: 20 },
  vehicleType: {
    type: String,
    enum: ["car", "motorcycle", "auto-rickshaw", "van", "commercial", "other"],
    required: true,
  },
  vehicleDescription: { type: String, trim: true, maxlength: 160, default: "" },
  location: {
    description: { type: String, trim: true, minlength: 5, maxlength: 300, required: true },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
  },
  safetyStatus: { type: String, enum: ["safe", "roadside-risk"], required: true },
  notes: { type: String, trim: true, maxlength: 500, default: "" },
  priority: { type: String, enum: ["standard", "urgent"], required: true, index: true },
  status: { type: String, enum: EMERGENCY_STATUSES, default: "requested", index: true },
  assignment: {
    dispatcherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    unitName: { type: String, trim: true, maxlength: 120 },
    unitPhone: { type: String, trim: true, maxlength: 20 },
    etaMinutes: { type: Number, min: 1, max: 240 },
    assignedAt: Date,
  },
  statusHistory: { type: [statusHistorySchema], default: [] },
  cancelledAt: Date,
  completedAt: Date,
}, { timestamps: true });

emergencyRequestSchema.pre("validate", function () {
  if (!this.requestId) this.requestId = `EMR-${randomUUID().split("-")[0].toUpperCase()}`;
  if (this.statusHistory.length === 0) {
    this.statusHistory.push({ status: "requested", actorId: this.userId });
  }
});

emergencyRequestSchema.index({ status: 1, priority: 1, createdAt: 1 });
emergencyRequestSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("EmergencyRequest", emergencyRequestSchema);