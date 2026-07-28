import { beforeEach, describe, expect, it, vi } from "vitest";

const findOne = vi.fn();
vi.mock("../models/Application.js", () => ({
  default: { findOne },
}));
vi.mock("../controllers/notificationController.js", () => ({
  createNotification: vi.fn(),
}));

const { getApplicationStatus } = await import("../controllers/applicationController.js");

const response = () => {
  const res = {
    statusCode: 200,
    payload: null,
    status: vi.fn((code) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((payload) => {
      res.payload = payload;
      return res;
    }),
  };
  return res;
};

const application = {
  applicationId: "GOV-12345678",
  userId: { toString: () => "owner-id" },
  email: "owner@example.gov",
  category: "government",
  serviceType: "Land record copy",
  status: "pending",
  createdAt: new Date("2026-01-01"),
};

describe("application ownership", () => {
  beforeEach(() => {
    findOne.mockReset();
    findOne.mockResolvedValue(application);
  });

  it("does not reveal another citizen's application status", async () => {
    const res = response();
    await getApplicationStatus(
      {
        params: { applicationId: application.applicationId },
        user: { userId: "another-id", email: "another@example.gov", role: "citizen" },
      },
      res,
    );

    expect(res.statusCode).toBe(403);
    expect(res.payload.error).toMatch(/do not have access/i);
  });

  it("allows the owner to see a minimal status response", async () => {
    const res = response();
    await getApplicationStatus(
      {
        params: { applicationId: application.applicationId },
        user: { userId: "owner-id", email: "owner@example.gov", role: "citizen" },
      },
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.payload).toMatchObject({
      applicationId: "GOV-12345678",
      status: "pending",
    });
    expect(res.payload).not.toHaveProperty("details");
  });

  it("allows administrators to inspect status for operational support", async () => {
    const res = response();
    await getApplicationStatus(
      {
        params: { applicationId: application.applicationId },
        user: { userId: "admin-id", email: "admin@example.gov", role: "admin" },
      },
      res,
    );

    expect(res.statusCode).toBe(200);
  });
});