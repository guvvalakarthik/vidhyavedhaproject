import "dotenv/config";
import app from "./app.js";
import connectDB from "./config.js";
import { ensureDefaultHealthcareProviders } from "./services/ensureHealthcareProviders.js";

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be set and contain at least 32 characters.");
  process.exit(1);
}

connectDB()
  .then(async () => {
    await ensureDefaultHealthcareProviders();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });