import { describe, expect, it } from "vitest";
import UtilityIssue from "../models/UtilityIssue.js";
import { UTILITY_GUIDES } from "../data/utilityGuides.js";

describe("utility issue tracking", () => {
  it("offers reviewed official routes and no payment or account credential fields", () => {
    expect(UTILITY_GUIDES).toHaveLength(4);
    expect(UTILITY_GUIDES.every(({ officialUrl, tasks }) => officialUrl.startsWith("https://") && tasks.length >= 5)).toBe(true);
    expect(UtilityIssue.schema.path("consumerNumber")).toBeUndefined();
    expect(UtilityIssue.schema.path("accountNumber")).toBeUndefined();
    expect(UtilityIssue.schema.path("paymentMode")).toBeUndefined();
    expect(UtilityIssue.schema.path("otp")).toBeUndefined();
  });

  it("keeps owner-scoped indexes and constrained status values", () => {
    const indexes = UtilityIssue.schema.indexes();
    expect(indexes.some(([fields]) => fields.userId === 1 && fields.createdAt === -1)).toBe(true);
    expect(indexes.some(([fields]) => fields.userId === 1 && fields.status === 1)).toBe(true);
    expect(UtilityIssue.schema.path("status").enumValues).toEqual(["tracking", "resolved", "archived"]);
  });
});
