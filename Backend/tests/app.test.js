import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";

let app;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret-that-is-longer-than-thirty-two-characters";
  ({ default: app } = await import("../app.js"));
});

describe("API shell", () => {
  it("reports health and applies security headers", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body.version).toBe("2.4.0");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-powered-by"]).toBeUndefined();
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

    const citizenToken = jwt.sign(
      { userId: "507f1f77bcf86cd799439011", email: "citizen@example.gov", role: "citizen" },
      process.env.JWT_SECRET,
      { algorithm: "HS256", issuer: "vidhya-vedha-api", audience: "vidhya-vedha-web", expiresIn: "5m" },
    );
    const forbidden = await request(app)
      .get("/api/emergency/dispatch/queue")
      .set("Authorization", `Bearer ${citizenToken}`);
    expect(forbidden.status).toBe(403);
  });

  it("publishes education pathways while protecting personal plans", async () => {
    const pathways = await request(app).get("/api/education/pathways");
    expect(pathways.status).toBe(200);
    expect(pathways.body.pathways).toHaveLength(6);

    const plan = await request(app).post("/api/education/plans").send({});
    expect(plan.status).toBe(401);

    const invalidPathway = await request(app).get("/api/education/pathways/not-a-pathway");
    expect(invalidPathway.status).toBe(422);
  });});