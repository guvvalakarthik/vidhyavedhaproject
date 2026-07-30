import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const USER_ROLES = ["citizen", "provider", "dispatcher", "admin"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    password: {
      type: String,
      required() {
        return !this.googleSub;
      },
      minlength: 8,
      select: false,
    },
    googleSub: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      maxlength: 255,
      select: false,
    },
    role: { type: String, enum: USER_ROLES, default: "citizen", index: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);