import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

let app;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret-that-is-longer-than-thirty-two-characters";
  ({ default: app } = await import("../app.js"));
});

describe("API shell", () => {
  it("reports health and applies security headers", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body.version).toBe("2.2.0");
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
});
