import mongoose from "mongoose";

const scheduleEntrySchema = new mongoose.Schema({
  dayOfWeek: { type: Number, min: 0, max: 6, required: true },
  startMinutes: { type: Number, min: 0, max: 1439, required: true },
  endMinutes: { type: Number, min: 1, max: 1440, required: true },
}, { _id: false });

const healthcareProviderSchema = new mongoose.Schema({
  providerCode: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  specialty: { type: String, required: true, trim: true, maxlength: 120, index: true },
  qualifications: { type: String, required: true, trim: true, maxlength: 180 },
  experienceYears: { type: Number, min: 0, max: 70, required: true },
  languages: [{ type: String, trim: true, maxlength: 60 }],
  modes: [{ type: String, enum: ["in-person", "video"] }],
  location: {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    address: { type: String, required: true, trim: true, maxlength: 240 },
  },
  consultationMinutes: { type: Number, enum: [15, 20, 30, 45, 60], default: 30 },
  weeklySchedule: { type: [scheduleEntrySchema], default: [] },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export default mongoose.model("HealthcareProvider", healthcareProviderSchema);