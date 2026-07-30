import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { sanitizePayload } from "../middleware/sanitizePayload.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { applicationSchema, availabilityQuerySchema } from "../validation/schemas.js";

const app = express();
app.use(express.json());
app.use(sanitizePayload);
app.post(
  "/applications",
  validateRequest({ body: applicationSchema }),
  (req, res) => res.status(201).json(req.body),
);

app.get(
  "/availability",
  validateRequest({ query: availabilityQuerySchema }),
  (req, res) => res.json(req.validated.query),
);

describe("request validation", () => {
  it("accepts and normalizes a valid application", async () => {
    const response = await request(app).post("/applications").send({
      name: "  Anjali Rao  ",
      email: "ANJALI@EXAMPLE.GOV",
      phone: "+91 98765 43210",
      serviceType: "Land record copy",
    });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Anjali Rao");
    expect(response.body.email).toBe("anjali@example.gov");
  });

  it("returns field-level errors for invalid data", async () => {
    const response = await request(app).post("/applications").send({
      name: "A",
      phone: "not-a-phone",
      serviceType: "X",
    });

    expect(response.status).toBe(422);
    expect(response.body.issues.map((issue) => issue.field)).toContain("body.name");
  });

  it("coerces validated query values without assigning Express query", async () => {
    const response = await request(app).get("/availability?from=2030-01-01&days=10");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ from: "2030-01-01", days: 10 });
  });

  it("blocks database operator keys before validation", async () => {
    const response = await request(app).post("/applications").send({
      name: "Anjali Rao",
      phone: "9876543210",
      serviceType: "Land record copy",
      $where: "return true",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/blocked field/i);
  });
});