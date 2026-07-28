import { describe, expect, it } from "vitest";
import EducationPlan from "../models/EducationPlan.js";
import { EDUCATION_PATHWAYS } from "../data/educationPathways.js";
import {
  buildEducationTasks,
  educationPlanStatus,
} from "../services/educationPlanService.js";
import { educationPlanSchema } from "../validation/schemas.js";

describe("education action planning", () => {
  it("publishes only verifiable official pathways with structured tasks", () => {
    expect(EDUCATION_PATHWAYS).toHaveLength(6);
    for (const pathway of EDUCATION_PATHWAYS) {
      expect(pathway.officialUrl).toMatch(/^https:\/\//);
      expect(pathway.tasks.length).toBeGreaterThanOrEqual(4);
      expect(new Set(pathway.tasks.map((task) => task.taskId)).size).toBe(pathway.tasks.length);
      expect(pathway.boundary).toBeTruthy();
    }
  });

  it("creates independent incomplete task records from catalogue steps", () => {
    const tasks = buildEducationTasks(EDUCATION_PATHWAYS[0]);
    expect(tasks.every((task) => task.status === "not-started" && task.completedAt === null)).toBe(true);
    tasks[0].status = "completed";
    expect(EDUCATION_PATHWAYS[0].tasks[0]).not.toHaveProperty("status");
  });

  it("marks a plan complete only when every task is complete", () => {
    expect(educationPlanStatus([{ status: "completed" }, { status: "not-started" }])).toBe("active");
    expect(educationPlanStatus([{ status: "completed" }, { status: "completed" }])).toBe("completed");
    expect(educationPlanStatus([])).toBe("active");
  });

  it("validates the pathway, learner stage and target cycle", () => {
    expect(educationPlanSchema.safeParse({
      pathwayCode: "scholarships",
      learnerStage: "undergraduate",
      target: "Post-matric scholarship",
      targetCycle: "current-cycle",
    }).success).toBe(true);
    expect(educationPlanSchema.safeParse({
      pathwayCode: "scholarships",
      learnerStage: "unknown",
      targetCycle: "soon",
    }).success).toBe(false);
  });

  it("defines owner history and status indexes", () => {
    const indexes = EducationPlan.schema.indexes();
    expect(indexes.some(([fields]) => fields.userId === 1 && fields.createdAt === -1)).toBe(true);
    expect(indexes.some(([fields]) => fields.userId === 1 && fields.status === 1)).toBe(true);
  });
});
