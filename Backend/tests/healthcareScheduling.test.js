import { describe, expect, it } from "vitest";
import HealthcareAppointment from "../models/HealthcareAppointment.js";
import {
  addDays,
  buildAvailableSlots,
  canModifyAppointment,
  dayOfWeek,
  findBookableSlot,
} from "../services/healthcareSchedulingService.js";

const provider = {
  consultationMinutes: 30,
  weeklySchedule: Array.from({ length: 7 }, (_, dayOfWeekValue) => ({
    dayOfWeek: dayOfWeekValue,
    startMinutes: 540,
    endMinutes: 660,
  })),
};

const now = new Date("2029-12-31T00:00:00.000Z");

describe("healthcare scheduling", () => {
  it("builds deterministic half-hour slots and excludes booked starts", () => {
    const allSlots = buildAvailableSlots({ provider, fromDate: "2030-01-01", days: 1, now });
    expect(allSlots).toHaveLength(4);

    const bookedStarts = new Set([new Date(allSlots[1].start).getTime()]);
    const remaining = buildAvailableSlots({ provider, fromDate: "2030-01-01", days: 1, bookedStarts, now });
    expect(remaining).toHaveLength(3);
    expect(remaining.map((slot) => slot.start)).not.toContain(allSlots[1].start);
  });

  it("accepts only an exact future slot from the provider schedule", () => {
    const slots = buildAvailableSlots({ provider, fromDate: "2030-01-01", days: 1, now });
    expect(findBookableSlot({ provider, startTime: slots[0].start, now })).toMatchObject({ start: slots[0].start });
    expect(findBookableSlot({ provider, startTime: "2030-01-01T04:45:00.000Z", now })).toBeNull();
  });

  it("applies calendar arithmetic and the two-hour modification boundary", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(dayOfWeek("2030-01-01")).toBe(2);
    expect(canModifyAppointment({ status: "booked", startTime: new Date(now.getTime() + 3 * 60 * 60 * 1000) }, now)).toBe(true);
    expect(canModifyAppointment({ status: "booked", startTime: new Date(now.getTime() + 60 * 60 * 1000) }, now)).toBe(false);
    expect(canModifyAppointment({ status: "cancelled", startTime: new Date(now.getTime() + 8 * 60 * 60 * 1000) }, now)).toBe(false);
  });

  it("declares atomic unique indexes for provider and patient booking collisions", () => {
    const indexes = HealthcareAppointment.schema.indexes();
    const providerIndex = indexes.find(([fields]) => fields.providerCode === 1 && fields.startTime === 1);
    const patientIndex = indexes.find(([fields]) => fields.userId === 1 && fields.startTime === 1);
    expect(providerIndex?.[1]).toMatchObject({ unique: true, partialFilterExpression: { status: "booked" } });
    expect(patientIndex?.[1]).toMatchObject({ unique: true, partialFilterExpression: { status: "booked" } });
  });
});