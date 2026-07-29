import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  documentId: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  label: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, enum: ["identity", "address", "income", "education", "health", "service-evidence", "other"], required: true },
  mimeType: { type: String, enum: ["application/pdf", "image/jpeg", "image/png"], required: true },
  size: { type: Number, required: true, min: 1, max: 5 * 1024 * 1024 },
  storageName: { type: String, required: true, select: false },
  contentIv: { type: String, required: true, select: false },
  contentTag: { type: String, required: true, select: false },
  nameCiphertext: { type: String, required: function requiredWhenActive() { return this.status === "active"; }, select: false },
  nameIv: { type: String, required: true, select: false },
  nameTag: { type: String, required: true, select: false },
  consentGrantedAt: { type: Date, required: true },
  consentVersion: { type: String, default: "vault-v1" },
  status: { type: String, enum: ["active", "revoked"], default: "active", index: true },
  revokedAt: Date,
}, { timestamps: true, optimisticConcurrency: true });
schema.pre("validate", function createId() { if (!this.documentId) this.documentId = `DOC-${randomUUID().split("-")[0].toUpperCase()}`; });
schema.index({ userId: 1, createdAt: -1 });
export default mongoose.model("VaultDocument", schema);
