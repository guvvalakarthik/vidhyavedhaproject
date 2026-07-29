import mongoose from "mongoose";

export const AI_SERVICES = ["all", "government", "education", "finance", "farming", "utilities", "ecommerce", "home-maintenance", "healthcare", "emergency"];
export const AI_LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi"];

const aiConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, trim: true, maxlength: 100, default: "New conversation" },
  service: { type: String, enum: AI_SERVICES, default: "all" },
  language: { type: String, enum: AI_LANGUAGES, default: "English" },
  lastActivityAt: { type: Date, required: true, default: Date.now, index: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

aiConversationSchema.index({ userId: 1, lastActivityAt: -1 });
aiConversationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AiConversation", aiConversationSchema);
