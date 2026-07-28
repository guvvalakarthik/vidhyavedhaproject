import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

const healthcareAppointmentSchema = new mongoose.Schema({
  confirmationCode: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: "HealthcareProvider", required: true },
  providerCode: { type: String, required: true, uppercase: true, index: true },
  providerName: { type: String, required: true },
  specialty: { type: String, required: true },
  location: {
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
  },
  mode: { type: String, enum: ["in-person", "video"], required: true },
  patientName: { type: String, required: true, trim: true, maxlength: 120 },
  patientEmail: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  reason: { type: String, required: true, trim: true, minlength: 3, maxlength: 500 },
  startTime: { type: Date, required: true, index: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ["booked", "cancelled", "completed", "no-show"], default: "booked", index: true },
  cancelledAt: Date,
  rescheduleHistory: { type: [historySchema], default: [] },
}, { timestamps: true });

healthcareAppointmentSchema.pre("validate", function () {
  if (!this.confirmationCode) this.confirmationCode = `APT-${randomUUID().split("-")[0].toUpperCase()}`;
});

healthcareAppointmentSchema.index(
  { providerCode: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: "booked" } },
);
healthcareAppointmentSchema.index(
  { userId: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: "booked" } },
);

export default mongoose.model("HealthcareAppointment", healthcareAppointmentSchema);