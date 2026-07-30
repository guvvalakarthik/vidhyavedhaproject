import { describe, expect, it } from "vitest";
import AgentAction from "../models/AgentAction.js";
import { inferTaskAction } from "../services/agentActionService.js";

const context = [
  {
    planType: "education",
    planId: "EDU-12345678",
    planTitle: "Scholarship preparation",
    status: "active",
    tasks: [
      { taskId: "check-eligibility", title: "Check eligibility", status: "not-started" },
      { taskId: "collect-documents", title: "Collect documents", status: "not-started" },
    ],
  },
  {
    planType: "finance",
    planId: "FIN-87654321",
    planTitle: "Education finance preparation",
    status: "active",
    tasks: [
      { taskId: "collect-documents", title: "Collect documents", status: "not-started" },
    ],
  },
];

describe("controlled agent actions", () => {
  it("requires an explicit change intent and an exact task", () => {
    expect(inferTaskAction("What is check eligibility?", context)).toBeNull();
    expect(inferTaskAction("Mark check-eligibility complete", context)).toEqual({
      planType: "education",
      planId: "EDU-12345678",
      taskId: "check-eligibility",
      completed: true,
    });
  });

  it("uses a plan id to disambiguate repeated task ids", () => {
    expect(inferTaskAction("Mark collect-documents complete", context)).toBeNull();
    expect(inferTaskAction("Mark FIN-87654321 collect-documents complete", context)).toEqual({
      planType: "finance",
      planId: "FIN-87654321",
      taskId: "collect-documents",
      completed: true,
    });
  });

  it("supports an explicit reset without applying it", () => {
    expect(inferTaskAction("Set EDU-12345678 check-eligibility to not started", context)).toEqual({
      planType: "education",
      planId: "EDU-12345678",
      taskId: "check-eligibility",
      completed: false,
    });
  });

  it("retains an audit record beyond the short approval window", () => {
    const paths = AgentAction.schema.paths;
    expect(paths.approvalExpiresAt.isRequired).toBe(true);
    expect(paths.expiresAt.isRequired).toBe(true);
    const ttlIndex = AgentAction.schema.indexes().find(([fields, options]) =>
      fields.expiresAt === 1 && options.expireAfterSeconds === 0,
    );
    expect(ttlIndex).toBeTruthy();
  });
});
