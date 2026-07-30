import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
      required() { return this.category !== "contact"; },
    },
    category: { type: String, required: true, index: true },
    serviceType: { type: String, required: true, trim: true, maxlength: 160 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, index: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["pending", "under-review", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

applicationSchema.pre("validate", function () {
  if (!this.applicationId) {
    const prefix = this.category ? this.category.slice(0, 3).toUpperCase() : "APP";
    this.applicationId = `${prefix}-${randomUUID().split("-")[0].toUpperCase()}`;
  }
});

export default mongoose.model("Application", applicationSchema);