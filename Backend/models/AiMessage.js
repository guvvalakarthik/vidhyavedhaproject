import mongoose from "mongoose";

const citationSchema = new mongoose.Schema({
  sourceId: { type: String, required: true, maxlength: 180 },
  service: { type: String, maxlength: 40 },
  title: { type: String, required: true, maxlength: 240 },
  authority: { type: String, maxlength: 240 },
  officialUrl: { type: String, maxlength: 600 },
}, { _id: false });

const aiMessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "AiConversation", required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true, maxlength: 12000 },
  citations: { type: [citationSchema], default: [] },
  mode: { type: String, enum: ["openai", "grounded-fallback", "user"], required: true },
  model: { type: String, maxlength: 100, default: null },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

aiMessageSchema.index({ conversationId: 1, createdAt: 1 });
aiMessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AiMessage", aiMessageSchema);
