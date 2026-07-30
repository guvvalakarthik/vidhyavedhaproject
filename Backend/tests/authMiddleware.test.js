import express from "express";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { requireCsrf } from "../services/authSessionService.js";

describe("authentication, CSRF, and role middleware", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      const role = req.get("x-test-role");
      if (role) {
        req.user = { userId: "user-1", email: "person@example.gov", role };
        req.authSession = { csrfToken: "known-csrf-token" };
      }
      next();
    });
    app.use(requireCsrf);
    app.get("/account", protect, (req, res) => res.json({ user: req.user }));
    app.get("/admin", protect, authorize("admin"), (_req, res) => res.json({ ok: true }));
    app.post("/account", protect, (_req, res) => res.json({ ok: true }));
  });

  it("rejects a request without a server session", async () => {
    const response = await request(app).get("/account");
    expect(response.status).toBe(401);
  });

  it("rejects a citizen from an administrator endpoint", async () => {
    const response = await request(app).get("/admin").set("x-test-role", "citizen");
    expect(response.status).toBe(403);
  });

  it("allows an administrator through the role guard", async () => {
    const response = await request(app).get("/admin").set("x-test-role", "admin");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it("requires the session CSRF token for state-changing requests", async () => {
    const rejected = await request(app).post("/account").set("x-test-role", "citizen");
    expect(rejected.status).toBe(403);

    const accepted = await request(app)
      .post("/account")
      .set("x-test-role", "citizen")
      .set("x-csrf-token", "known-csrf-token");
    expect(accepted.status).toBe(200);
  });
});
