import { describe, expect, it } from "vitest";
import FarmingPlan from "../models/FarmingPlan.js";
import { FARMING_PATHWAYS } from "../data/farmingPathways.js";
import { buildFarmingTasks, farmingPlanStatus } from "../services/farmingPlanService.js";

describe("farming action planning", () => {
  it("offers official pathways without collecting sensitive application data", () => {
    expect(FARMING_PATHWAYS).toHaveLength(4);
    expect(FARMING_PATHWAYS.every(({ officialUrl }) => officialUrl.startsWith("https://"))).toBe(true);
    expect(FarmingPlan.schema.path("aadhaarNumber")).toBeUndefined();
    expect(FarmingPlan.schema.path("bankAccountNumber")).toBeUndefined();
    expect(FarmingPlan.schema.path("farmerId")).toBeUndefined();
    expect(FarmingPlan.schema.path("landRecord")).toBeUndefined();
  });

  it("builds trackable tasks and derives completion", () => {
    const tasks = buildFarmingTasks(FARMING_PATHWAYS[0]);
    expect(tasks.every(({ status }) => status === "not-started")).toBe(true);
    expect(farmingPlanStatus(tasks)).toBe("active");
    tasks.forEach((task) => { task.status = "completed"; });
    expect(farmingPlanStatus(tasks)).toBe("completed");
  });

  it("indexes owner-scoped plan lookups", () => {
    const indexes = FarmingPlan.schema.indexes();
    expect(indexes.some(([fields]) => fields.userId === 1 && fields.createdAt === -1)).toBe(true);
    expect(indexes.some(([fields]) => fields.userId === 1 && fields.status === 1)).toBe(true);
  });
});
