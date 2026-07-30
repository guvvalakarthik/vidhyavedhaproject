import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import app from "../app.js";

describe("Google authentication routes", () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;

  afterEach(() => {
    if (originalClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = originalClientId;
  });

  it("reports when Google sign-in has not been configured", async () => {
    delete process.env.GOOGLE_CLIENT_ID;

    const response = await request(app).get("/api/auth/google/config");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ enabled: false });
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("issues a short-lived HTTP-only nonce with the public client ID", async () => {
    process.env.GOOGLE_CLIENT_ID = "web-client.apps.googleusercontent.com";

    const response = await request(app).get("/api/auth/google/config");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      enabled: true,
      clientId: "web-client.apps.googleusercontent.com",
      nonce: expect.any(String),
    }));
    expect(response.body.nonce.length).toBeGreaterThan(30);
    expect(response.headers["set-cookie"][0]).toMatch(/vv_google_nonce=.*HttpOnly.*SameSite=Lax/i);
  });

  it("rejects malformed credentials before token verification", async () => {
    const response = await request(app)
      .post("/api/auth/google")
      .send({ credential: "not-a-google-id-token" });

    expect(response.status).toBe(422);
    expect(response.body.error).toMatch(/validation failed/i);
  });
});
