import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { isLivenessRequest, isPublicCatalogueRequest, restoreApiRequestUrl } from "../../api/index.js";

let app;

beforeAll(async () => {
  process.env.SESSION_SECRET = "test-secret-that-is-longer-than-thirty-two-characters";
  delete process.env.MONGO_URI;
  ({ default: app } = await import("../app.js"));
}, 30_000);

const catalogueEndpoints = [
  ["/api/government/services", "services"],
  ["/api/education/pathways", "pathways"],
  ["/api/finance/pathways", "pathways"],
  ["/api/farming/pathways", "pathways"],
  ["/api/utilities/guides", "guides"],
  ["/api/ecommerce/guides", "guides"],
  ["/api/emergency/services", "services"],
  ["/api/healthcare/providers", "providers"],
  ["/api/home-maintenance/providers", "providers"],
];

describe("Vercel full-stack deployment", () => {
  it.each(catalogueEndpoints)("serves public catalogue %s without a database", async (endpoint, key) => {
    const response = await request(app).get(endpoint);
    expect(response.status).toBe(200);
    expect(response.body[key].length).toBeGreaterThan(0);
  });

  it("serves public healthcare and home availability without a database", async () => {
    const healthcare = await request(app)
      .get("/api/healthcare/providers/DR-ANANYA-RAO/availability?from=2030-01-01&days=2");
    expect(healthcare.status).toBe(200);
    expect(healthcare.body.slots.length).toBeGreaterThan(0);

    const home = await request(app)
      .get("/api/home-maintenance/providers/HOME-ELECTRICAL/availability?from=2030-01-01&days=2");
    expect(home.status).toBe(200);
    expect(home.body.slots.length).toBeGreaterThan(0);
  });

  it("restores the original API path and query after the Vercel rewrite", () => {
    const req = { query: { path: "healthcare/providers", days: "7" }, url: "/api/index" };
    expect(restoreApiRequestUrl(req)).toBe("/api/healthcare/providers");
    expect(req.url).toBe("/api/healthcare/providers?days=7");
    expect(isPublicCatalogueRequest("GET", req.url.split("?")[0])).toBe(true);
    expect(isPublicCatalogueRequest("POST", req.url.split("?")[0])).toBe(false);

    const transparentRewrite = { query: { days: "7" }, url: "/api/healthcare/providers?days=7" };
    expect(restoreApiRequestUrl(transparentRewrite)).toBe("/api/healthcare/providers");
    expect(transparentRewrite.url).toBe("/api/healthcare/providers?days=7");
  });

  it("allows liveness checks without waiting for MongoDB", () => {
    expect(isLivenessRequest("GET", "/api/health/live")).toBe(true);
    expect(isLivenessRequest("POST", "/api/health/live")).toBe(false);
    expect(isLivenessRequest("GET", "/api/health/ready")).toBe(false);
  });
});
