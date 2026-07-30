import "dotenv/config";
import app from "./app.js";
import connectDB from "./config.js";
import { ensureDefaultHealthcareProviders } from "./services/ensureHealthcareProviders.js";
import { startReminderWorker } from "./services/reminderAgentService.js";

const PORT = process.env.PORT || 5000;
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  console.error("SESSION_SECRET must be set and contain at least 32 characters.");
  process.exit(1);
}

connectDB()
  .then(async () => {
    await ensureDefaultHealthcareProviders();
    startReminderWorker();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
