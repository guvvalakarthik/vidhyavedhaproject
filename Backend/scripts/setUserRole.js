import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config.js";
import User, { USER_ROLES } from "../models/User.js";

const [emailArgument, roleArgument = "admin"] = process.argv.slice(2);
const email = emailArgument?.trim().toLowerCase();
const role = roleArgument?.trim().toLowerCase();

if (!email || !USER_ROLES.includes(role)) {
  console.error(`Usage: npm run set-role -- user@example.gov ${USER_ROLES.join("|")}`);
  process.exitCode = 1;
} else {
  try {
    await connectDB();
    const user = await User.findOneAndUpdate({ email }, { role }, { new: true });
    if (!user) throw new Error(`No user found for ${email}`);
    console.log(`Updated ${user.email} to role: ${user.role}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}