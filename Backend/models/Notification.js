import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    applicationId: { type: String, required: true },
    category: { type: String, required: true },
    serviceType: { type: String, required: true },
    oldStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
