import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
const findById = vi.fn();
vi.mock("../models/Application.js", () => ({
  default: { create, find: vi.fn(), findOne: vi.fn(), deleteOne: vi.fn() },
}));
vi.mock("../models/User.js", () => ({
  default: { findById },
}));

const { createGovernmentAssistanceRequest } = await import("../controllers/governmentController.js");

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

describe("government assistance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: "user-id",
        name: "Anjali Rao",
        email: "anjali@example.gov",
      }),
    });
    create.mockImplementation(async (record) => ({
      ...record,
      applicationId: "GOV-12345678",
      status: "pending",
      createdAt: new Date("2026-07-28T10:00:00.000Z"),
      updatedAt: new Date("2026-07-28T10:00:00.000Z"),
    }));
  });

  it("creates a scoped support request without collecting official identity numbers", async () => {
    const res = response();
    await createGovernmentAssistanceRequest({
      user: { userId: "user-id" },
      body: {
        serviceCode: "passport",
        supportMode: "digital-guidance",
        district: "Hyderabad",
        preferredLanguage: "Telugu",
        phone: "9876543210",
        notes: "Need help understanding the document advisor.",
        consent: true,
      },
    }, res);

    expect(res.statusCode).toBe(201);
    expect(res.payload.request).toMatchObject({
      requestId: "GOV-12345678",
      serviceCode: "passport",
      serviceName: "Passport services",
    });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      category: "government",
      name: "Anjali Rao",
      details: expect.objectContaining({ scope: "assisted-guidance" }),
    }));
    expect(JSON.stringify(create.mock.calls[0][0])).not.toMatch(/aadhaarNumber|passportNumber|panNumber/i);
  });

  it("rejects service codes that are not in the guidance catalogue", async () => {
    const res = response();
    await createGovernmentAssistanceRequest({
      user: { userId: "user-id" },
      body: {
        serviceCode: "unlisted",
        supportMode: "digital-guidance",
        district: "Hyderabad",
        preferredLanguage: "English",
        phone: "9876543210",
        consent: true,
      },
    }, res);

    expect(res.statusCode).toBe(404);
    expect(create).not.toHaveBeenCalled();
  });
});