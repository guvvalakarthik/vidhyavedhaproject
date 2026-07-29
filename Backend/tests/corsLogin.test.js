import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";

describe("development login origin", () => {
  it("allows credentialed authentication requests from the documented frontend port", async () => {
    const response = await request(app)
      .options("/api/auth/login")
      .set("Origin", "http://127.0.0.1:3002")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("http://127.0.0.1:3002");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });
});
