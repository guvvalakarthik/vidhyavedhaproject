import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
vi.mock("../models/EducationPlan.js", () => ({
  default: { create, find: vi.fn(), findOne: vi.fn() },
}));

const { createEducationPlan } = await import("../controllers/educationController.js");

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

describe("education plan creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    create.mockImplementation(async (record) => ({
      ...record,
      planId: "EDU-12345678",
      status: "active",
      createdAt: new Date("2026-07-28T10:00:00.000Z"),
      updatedAt: new Date("2026-07-28T10:00:00.000Z"),
    }));
  });

  it("creates a scoped preparation plan without collecting records or identity data", async () => {
    const res = response();
    await createEducationPlan({
      user: { userId: "user-id" },
      body: {
        pathwayCode: "scholarships",
        learnerStage: "undergraduate",
        target: "Post-matric scholarship",
        targetCycle: "current-cycle",
      },
    }, res);

    expect(res.statusCode).toBe(201);
    expect(res.payload.plan).toMatchObject({
      planId: "EDU-12345678",
      pathwayCode: "scholarships",
      learnerStage: "undergraduate",
    });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-id",
      pathwayTitle: "Find and apply for scholarships",
      tasks: expect.arrayContaining([
        expect.objectContaining({ taskId: "read-current-guidance", status: "not-started" }),
      ]),
    }));
    expect(JSON.stringify(create.mock.calls[0][0])).not.toMatch(/aadhaar|rollNumber|marks|certificateNumber/i);
  });

  it("rejects a pathway that does not support the selected learner stage", async () => {
    const res = response();
    await createEducationPlan({
      user: { userId: "user-id" },
      body: {
        pathwayCode: "scholarships",
        learnerStage: "international",
        target: "",
        targetCycle: "exploring",
      },
    }, res);

    expect(res.statusCode).toBe(422);
    expect(create).not.toHaveBeenCalled();
  });
});
