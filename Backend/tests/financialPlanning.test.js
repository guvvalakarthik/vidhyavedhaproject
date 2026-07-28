import { describe, expect, it } from "vitest";
import FinancialPlan from "../models/FinancialPlan.js";
import {
  FINANCIAL_NEED_CODES,
  FINANCIAL_PATHWAYS,
} from "../data/financialPathways.js";
import {
  buildFinancialTasks,
  financialPlanStatus,
} from "../services/financialPlanService.js";
import {
  financialPlanSchema,
  financialTaskUpdateSchema,
} from "../validation/schemas.js";

describe("financial guidance planning", () => {
  it("publishes six official pathways with actionable preparation and warnings", () => {
    expect(FINANCIAL_PATHWAYS).toHaveLength(6);
    expect(FINANCIAL_NEED_CODES).toContain("banking-complaint");
    expect(FINANCIAL_NEED_CODES).toContain("insurance-complaint");

    for (const pathway of FINANCIAL_PATHWAYS) {
      expect(pathway.officialUrl).toMatch(/^https:\/\//);
      expect(pathway.tasks.length).toBeGreaterThanOrEqual(5);
      expect(pathway.preparationItems.length).toBeGreaterThanOrEqual(3);
      expect(pathway.watchFor.length).toBeGreaterThanOrEqual(3);
      expect(new Set(pathway.tasks.map(({ taskId }) => taskId)).size).toBe(pathway.tasks.length);
      expect(pathway.boundary).toBeTruthy();
    }
  });

  it("creates independent incomplete task records and derives plan status", () => {
    const tasks = buildFinancialTasks(FINANCIAL_PATHWAYS[0]);
    expect(tasks.every(({ status, completedAt }) => status === "not-started" && completedAt === null)).toBe(true);
    tasks[0].status = "completed";
    expect(FINANCIAL_PATHWAYS[0].tasks[0]).not.toHaveProperty("status");

    expect(financialPlanStatus([{ status: "completed" }, { status: "not-started" }])).toBe("active");
    expect(financialPlanStatus([{ status: "completed" }, { status: "completed" }])).toBe("completed");
    expect(financialPlanStatus([])).toBe("active");
  });

  it("accepts only the minimal preparation-plan contract", () => {
    expect(financialPlanSchema.safeParse({
      pathwayCode: "government-credit",
      target: "Working capital research",
      planningHorizon: "within-three-months",
    }).success).toBe(true);
    expect(financialPlanSchema.safeParse({
      pathwayCode: "government-credit",
      planningHorizon: "now",
      annualIncome: 900000,
    }).success).toBe(false);
    expect(financialPlanSchema.safeParse({
      pathwayCode: "unknown",
      planningHorizon: "soon",
    }).success).toBe(false);
    expect(financialTaskUpdateSchema.safeParse({ completed: true, accountNumber: "123" }).success).toBe(false);
  });

  it("defines owner history and status indexes", () => {
    const indexes = FinancialPlan.schema.indexes();
    expect(indexes.some(([fields]) => fields.userId === 1 && fields.createdAt === -1)).toBe(true);
    expect(indexes.some(([fields]) => fields.userId === 1 && fields.status === 1)).toBe(true);
  });
});
