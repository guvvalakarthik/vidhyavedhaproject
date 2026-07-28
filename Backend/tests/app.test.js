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
    expect(response.body.version).toBe("2.0.0");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("returns a JSON 404 response", async () => {
    const response = await request(app).get("/not-a-route");
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Route not found.");
  });
});