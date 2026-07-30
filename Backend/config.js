import mongoose from "mongoose";

mongoose.set("sanitizeFilter", true);
mongoose.set("strictQuery", true);

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set in environment variables");
  await mongoose.connect(uri);
  console.log("MongoDB Connected");
};

export default connectDB;