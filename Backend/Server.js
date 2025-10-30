import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import emergencyRoutes from "./routes/emergencyRoutes.js";
import educationRoutes from "./routes/educationRoutes.js";

dotenv.config();

const app = express();

// Middleware to parse JSON body
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use((req, res, next) => {
  req.dbFilePath = path.join(__dirname, "db.json");
  next();
});

// Routes must be registered after express.json()
app.use("/api/emergency", emergencyRoutes);
app.use("/api/education", educationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
