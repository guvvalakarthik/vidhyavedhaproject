import mongoose from "mongoose";

const authSessionSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true, index: true },
  csrfToken: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  userAgent: { type: String, maxlength: 500, default: "" },
  ipHash: { type: String, maxlength: 128, default: "" },
  lastSeenAt: { type: Date, required: true, default: Date.now },
  idleExpiresAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  revokedAt: Date,
}, { timestamps: true });

authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
authSessionSchema.index({ userId: 1, revokedAt: 1, lastSeenAt: -1 });

export default mongoose.model("AuthSession", authSessionSchema);
