import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { COMPANION_SERVICE_CODES } from "../data/companionServices.js";
import { DRAFT_TYPES } from "../data/draftTemplates.js";

const contentSchema = new mongoose.Schema({
  subject: { type: String, required: true, maxlength: 180 },
  salutation: { type: String, required: true, maxlength: 220 },
  paragraphs: { type: [String], required: true, validate: [(value) => value.length >= 2 && value.length <= 6 && value.every((paragraph) => paragraph.length <= 1800), "Use two to six concise paragraphs."] },
  closing: { type: String, required: true, maxlength: 220 },
}, { _id: false });

const schema = new mongoose.Schema({
  draftId: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  readinessId: { type: String, default: "", index: true },
  serviceCode: { type: String, enum: COMPANION_SERVICE_CODES, required: true },
  serviceTitle: { type: String, required: true, maxlength: 120 },
  draftType: { type: String, enum: DRAFT_TYPES, required: true },
  recipient: { type: String, required: true, maxlength: 160 },
  subject: { type: String, required: true, maxlength: 180 },
  facts: { type: String, required: true, maxlength: 1800 },
  chronology: { type: String, maxlength: 1200, default: "" },
  requestedOutcome: { type: String, required: true, maxlength: 800 },
  referenceLabel: { type: String, maxlength: 100, default: "" },
  signerName: { type: String, maxlength: 120, default: "" },
  content: { type: contentSchema, required: true },
  mode: { type: String, enum: ["reviewed-template", "openai"], required: true },
  model: { type: String, default: null },
  revision: { type: Number, default: 1, min: 1 },
  status: { type: String, enum: ["draft", "finalized", "archived"], default: "draft", index: true },
  finalizedAt: Date,
  archivedAt: Date,
}, { timestamps: true, optimisticConcurrency: true });

schema.pre("validate", function createId() {
  if (!this.draftId) this.draftId = `DRF-${randomUUID().split("-")[0].toUpperCase()}`;
});
schema.index({ userId: 1, createdAt: -1 });
schema.index({ userId: 1, status: 1 });

export default mongoose.model("ServiceDraft", schema);
