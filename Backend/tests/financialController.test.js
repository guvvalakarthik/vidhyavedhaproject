import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
vi.mock("../models/FinancialPlan.js", () => ({
  default: { create, find: vi.fn(), findOne: vi.fn() },
}));

const { createFinancialPlan } = await import("../controllers/financialController.js");

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

describe("financial plan creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    create.mockImplementation(async (record) => ({
      ...record,
      planId: "FIN-12345678",
      status: "active",
      createdAt: new Date("2026-07-28T10:00:00.000Z"),
      updatedAt: new Date("2026-07-28T10:00:00.000Z"),
    }));
  });

  it("creates a scoped checklist without collecting application or financial data", async () => {
    const res = response();
    await createFinancialPlan({
      user: { userId: "user-id" },
      body: {
        pathwayCode: "government-credit",
        target: "Working capital research",
        planningHorizon: "within-three-months",
      },
    }, res);

    expect(res.statusCode).toBe(201);
    expect(res.payload.plan).toMatchObject({
      planId: "FIN-12345678",
      pathwayCode: "government-credit",
      planningHorizon: "within-three-months",
    });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-id",
      pathwayTitle: "Explore credit-linked government schemes",
      tasks: expect.arrayContaining([
        expect.objectContaining({ taskId: "define-credit-purpose", status: "not-started" }),
      ]),
    }));
    expect(JSON.stringify(create.mock.calls[0][0])).not.toMatch(
      /income|creditScore|accountNumber|policyNumber|nominee|aadhaar|principal|interestRate/i,
    );
  });
});
