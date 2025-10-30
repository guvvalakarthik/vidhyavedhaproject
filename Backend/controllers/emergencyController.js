import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, "../db.json");

function readDB() {
  try {
    const data = fs.readFileSync(dbFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return { emergency: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
}

export const submitEmergencyRequest = (req, res) => {
  const { name, phone, serviceType, ...rest } = req.body;
  if (!name || !phone || !serviceType) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  try {
    const db = readDB();
    if (!db.emergency) db.emergency = [];
    const newId =
      db.emergency.length > 0
        ? db.emergency[db.emergency.length - 1].id + 1
        : 1;
    const newRequest = {
      id: newId,
      name,
      phone,
      serviceType,
      ...rest,
      submittedAt: new Date().toISOString(),
    };
    db.emergency.push(newRequest);
    writeDB(db);
    res.status(201).json(newRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllEmergencyRequests = (req, res) => {
  try {
    const db = readDB();
    res.json(db.emergency || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
