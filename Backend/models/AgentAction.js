import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

const agentActionSchema = new mongoose.Schema({
  actionId: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "AiConversation", required: true, index: true },
  actionType: { type: String, enum: ["update-plan-task"], required: true },
  planType: { type: String, enum: ["education", "finance"], required: true },
  planId: { type: String, required: true, maxlength: 40 },
  taskId: { type: String, required: true, maxlength: 80 },
  taskTitle: { type: String, required: true, maxlength: 160 },
  completed: { type: Boolean, required: true },
  summary: { type: String, required: true, maxlength: 360 },
  status: {
    type: String,
    enum: ["pending", "executing", "confirmed", "cancelled", "expired", "failed"],
    default: "pending",
    index: true,
  },
  result: { type: String, maxlength: 500, default: null },
  approvalExpiresAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  confirmedAt: Date,
  cancelledAt: Date,
}, { timestamps: true });

agentActionSchema.pre("validate", function () {
  if (!this.actionId) this.actionId = `ACT-${randomUUID().split("-")[0].toUpperCase()}`;
});

agentActionSchema.index({ userId: 1, status: 1, createdAt: -1 });
agentActionSchema.index({ conversationId: 1, createdAt: 1 });
agentActionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AgentAction", agentActionSchema);
