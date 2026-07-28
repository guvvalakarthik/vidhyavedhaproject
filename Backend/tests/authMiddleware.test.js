import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { authorize, protect } from "../middleware/authMiddleware.js";

const secret = "test-secret-that-is-longer-than-thirty-two-characters";

const tokenFor = (role) => jwt.sign(
  { userId: "user-1", email: "person@example.gov", role },
  secret,
  {
    algorithm: "HS256",
    expiresIn: "10m",
    issuer: "vidhya-vedha-api",
    audience: "vidhya-vedha-web",
  },
);

describe("authentication and role middleware", () => {
  let app;

  beforeAll(() => {
    process.env.JWT_SECRET = secret;
    app = express();
    app.get("/account", protect, (req, res) => res.json({ user: req.user }));
    app.get("/admin", protect, authorize("admin"), (_req, res) => res.json({ ok: true }));
  });

  it("rejects a request without a bearer token", async () => {
    const response = await request(app).get("/account");
    expect(response.status).toBe(401);
  });

  it("rejects a citizen from an administrator endpoint", async () => {
    const response = await request(app)
      .get("/admin")
      .set("Authorization", `Bearer ${tokenFor("citizen")}`);
    expect(response.status).toBe(403);
  });

  it("allows an administrator through the role guard", async () => {
    const response = await request(app)
      .get("/admin")
      .set("Authorization", `Bearer ${tokenFor("admin")}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});