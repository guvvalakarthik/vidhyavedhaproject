import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import governmentRoutes from "./routes/governmentRoutes.js";
import healthcareRoutes from "./routes/healthcareRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import educationRoutes from "./routes/educationRoutes.js";
import financialRoutes from "./routes/financialRoutes.js";
import farmingRoutes from "./routes/farmingRoutes.js";
import utilityIssueRoutes from "./routes/utilityIssueRoutes.js";
import commerceCaseRoutes from "./routes/commerceCaseRoutes.js";
import homeServiceRoutes from "./routes/homeServiceRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import companionRoutes from "./routes/companionRoutes.js";
import readinessRoutes from "./routes/readinessRoutes.js";
import draftRoutes from "./routes/draftRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import statusTrackerRoutes from "./routes/statusTrackerRoutes.js";
import handoffRoutes from "./routes/handoffRoutes.js";
import documentVaultRoutes from "./routes/documentVaultRoutes.js";
import { sanitizePayload } from "./middleware/sanitizePayload.js";
import { optionalSession, requireCsrf } from "./services/authSessionService.js";

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(sanitizePayload);
app.use(optionalSession);
app.use(requireCsrf);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.get("/", (_req, res) => {
  res.json({ message: "Vidhya Vedha API Running", version: "2.5.0" });
});
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/companion", aiLimiter, companionRoutes);
app.use("/api/readiness", apiLimiter, readinessRoutes);
app.use("/api/drafts", aiLimiter, draftRoutes);
app.use("/api/reminders", apiLimiter, reminderRoutes);
app.use("/api/status-trackers", apiLimiter, statusTrackerRoutes);
app.use("/api/handoffs", apiLimiter, handoffRoutes);
app.use("/api/vault", apiLimiter, documentVaultRoutes);
app.use("/api/government", apiLimiter, governmentRoutes);
app.use("/api/healthcare", apiLimiter, healthcareRoutes);
app.use("/api/emergency", apiLimiter, emergencyRoutes);
app.use("/api/education", apiLimiter, educationRoutes);
app.use("/api/finance", apiLimiter, financialRoutes);
app.use("/api/farming", apiLimiter, farmingRoutes);
app.use("/api/utilities", apiLimiter, utilityIssueRoutes);
app.use("/api/ecommerce", apiLimiter, commerceCaseRoutes);
app.use("/api/home-maintenance", apiLimiter, homeServiceRoutes);
app.use("/api/notifications", apiLimiter, notificationRoutes);
app.use("/api", apiLimiter, applicationRoutes);

app.use((_req, res) => res.status(404).json({ error: "Route not found." }));
app.use((err, _req, res, _next) => {
  if (err?.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "Document must be 5 MB or smaller." });
  if (err.message === "Origin is not allowed by CORS.") {
    return res.status(403).json({ error: err.message });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Internal server error." });
});

export default app;
