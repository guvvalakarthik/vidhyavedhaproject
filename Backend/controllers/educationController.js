import fs from "fs";

export const submitEducationForm = (req, res) => {
  console.log("Received POST body:", req.body);

  const dbFilePath = req.dbFilePath;
  const { name, email, phone, serviceType, ...rest } = req.body;

  if (!name || !email || !phone || !serviceType) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    let db = { education: [] };
    if (fs.existsSync(dbFilePath)) {
      const fileContent = fs.readFileSync(dbFilePath, "utf-8");
      db = JSON.parse(fileContent);
    }

    if (!db.education) db.education = [];

    const newId =
      db.education.length > 0
        ? db.education[db.education.length - 1].id + 1
        : 1;

    const newApplication = {
      id: newId,
      name,
      email,
      phone,
      serviceType,
      ...rest,
      submittedAt: new Date().toISOString(),
    };

    db.education.push(newApplication);
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));

    res.status(201).json(newApplication);
  } catch (error) {
    console.error("Error writing db.json:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllEducationApplications = (req, res) => {
  const dbFilePath = req.dbFilePath;
  try {
    if (!fs.existsSync(dbFilePath)) {
      return res.json([]);
    }
    const data = fs.readFileSync(dbFilePath, "utf-8");
    const db = JSON.parse(data);
    res.json(db.education || []);
  } catch (error) {
    console.error("Error reading db.json:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
