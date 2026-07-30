import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";

let app;

beforeAll(async () => {
  process.env.SESSION_SECRET = "test-secret-that-is-longer-than-thirty-two-characters";
  process.env.VERCEL = "1";
  ({ default: app } = await import("../app.js"));
}, 30_000);

describe("API shell", () => {
  it("reports health and applies security headers", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body.version).toBe("2.5.0");
    expect(app.get("trust proxy")).toBe(1);
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("reports malformed JSON as a client error", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Request body must contain valid JSON.");
  });

  it("accepts Vercel proxy headers without rate-limit validation errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const response = await request(app)
        .get("/api/auth/me")
        .set("X-Forwarded-For", "203.0.113.10")
        .set("Forwarded", "for=203.0.113.10");

      expect(response.status).toBe(401);
      expect(consoleError.mock.calls.flat().join(" ")).not.toContain("ERR_ERL_");
    } finally {
      consoleError.mockRestore();
    }
  });

  it("returns a JSON 404 response", async () => {
    const response = await request(app).get("/not-a-route");
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Route not found.");
  });

  it("protects appointment booking and validates provider routes before database access", async () => {
    const booking = await request(app).post("/api/healthcare/appointments").send({});
    expect(booking.status).toBe(401);

    const availability = await request(app).get("/api/healthcare/providers/bad!/availability?days=7");
    expect(availability.status).toBe(422);
  });

  it("publishes government guidance while protecting assisted requests", async () => {
    const services = await request(app).get("/api/government/services");
    expect(services.status).toBe(200);
    expect(services.body.services).toHaveLength(6);
    expect(services.body.services[0]).not.toHaveProperty("searchTags");

    const requestResponse = await request(app).post("/api/government/requests").send({});
    expect(requestResponse.status).toBe(401);

    const unknown = await request(app).get("/api/government/services/not-a-service");
    expect(unknown.status).toBe(422);
  });

  it("publishes roadside services while protecting requests and dispatch", async () => {
    const services = await request(app).get("/api/emergency/services");
    expect(services.status).toBe(200);
    expect(services.body.services).toHaveLength(6);

    const roadsideRequest = await request(app).post("/api/emergency/requests").send({});
    expect(roadsideRequest.status).toBe(401);

    const dispatchQueue = await request(app).get("/api/emergency/dispatch/queue");
    expect(dispatchQueue.status).toBe(401);
  });

  it("publishes financial pathways while protecting preparation plans", async () => {
    const pathways = await request(app).get("/api/finance/pathways");
    expect(pathways.status).toBe(200);
    expect(pathways.body.pathways).toHaveLength(6);
    expect(pathways.body.pathways[0]).not.toHaveProperty("searchTags");

    const plan = await request(app).post("/api/finance/plans").send({});
    expect(plan.status).toBe(401);

    const invalidPathway = await request(app).get("/api/finance/pathways/not-a-pathway");
    expect(invalidPathway.status).toBe(422);
  });

  it("publishes education pathways while protecting personal plans", async () => {
    const pathways = await request(app).get("/api/education/pathways");
    expect(pathways.status).toBe(200);
    expect(pathways.body.pathways).toHaveLength(6);

    const plan = await request(app).post("/api/education/plans").send({});
    expect(plan.status).toBe(401);

    const invalidPathway = await request(app).get("/api/education/pathways/not-a-pathway");
    expect(invalidPathway.status).toBe(422);
  });
});
