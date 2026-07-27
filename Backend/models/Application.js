import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, unique: true, index: true },
    category: { type: String, required: true, index: true },
    serviceType: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, trim: true },
    phone: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["pending", "under-review", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

applicationSchema.pre("validate", function (next) {
  if (!this.applicationId) {
    const prefix = this.category ? this.category.slice(0, 3).toUpperCase() : "APP";
    this.applicationId = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

export default mongoose.model("Application", applicationSchema);
