import { describe, expect, it } from "vitest";
import Reminder, { REMINDER_CADENCES, REMINDER_SOURCE_TYPES } from "../models/Reminder.js";
import Notification from "../models/Notification.js";
import { reminderSchema } from "../validation/schemas.js";

describe("consent-controlled reminder agent", () => {
  it("supports owned task sources and explicit cadences", () => {
    expect(REMINDER_SOURCE_TYPES).toEqual(["readiness", "draft", "custom"]);
    expect(REMINDER_CADENCES).toEqual(["once", "daily", "weekly"]);
    expect(Reminder.schema.indexes().some(([fields]) => fields.status === 1 && fields.nextRunAt === 1)).toBe(true);
  });
  it("requires explicit opt-in and strips it before persistence", () => {
    const input = { sourceType: "custom", sourceId: "", title: "Finish benefit preparation", dueAt: "2026-08-01T09:00:00.000Z", cadence: "weekly", consent: true };
    const parsed = reminderSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    expect(parsed.data.consent).toBeUndefined();
    expect(reminderSchema.safeParse({ ...input, consent: false }).success).toBe(false);
  });
  it("extends notifications without exposing a delivery channel", () => {
    expect(Notification.schema.path("kind").enumValues).toEqual(["status", "reminder"]);
    expect(Reminder.schema.path("channel").enumValues).toEqual(["in-app"]);
  });
});
