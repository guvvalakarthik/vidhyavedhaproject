import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config.js";
import HealthcareProvider from "../models/HealthcareProvider.js";
import { DEFAULT_HEALTHCARE_PROVIDERS } from "../data/healthcareProviders.js";

try {
  await connectDB();
  await HealthcareProvider.bulkWrite(
    DEFAULT_HEALTHCARE_PROVIDERS.map((provider) => ({
      updateOne: {
        filter: { providerCode: provider.providerCode },
        update: { $set: provider },
        upsert: true,
      },
    })),
  );
  console.log(`Seeded ${DEFAULT_HEALTHCARE_PROVIDERS.length} healthcare providers.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}