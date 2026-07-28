import { describe, expect, it } from "vitest";
import mongoose from "mongoose";
import EmergencyRequest from "../models/EmergencyRequest.js";
import { trustedActiveEmergencyStatuses } from "../controllers/emergencyController.js";
import {
  canCancelEmergencyRequest,
  canTransitionEmergencyRequest,
  nextDispatchStatus,
  priorityForSafety,
} from "../services/emergencyDispatchService.js";
import {
  emergencyAssignmentSchema,
  emergencyRequestSchema,
} from "../validation/schemas.js";

describe("emergency roadside dispatch", () => {
  it("derives priority from the caller's roadside safety state", () => {
    expect(priorityForSafety("safe")).toBe("standard");
    expect(priorityForSafety("roadside-risk")).toBe("urgent");
  });

  it("enforces a sequential response lifecycle", () => {
    expect(nextDispatchStatus("assigned")).toBe("en-route");
    expect(nextDispatchStatus("en-route")).toBe("arrived");
    expect(nextDispatchStatus("arrived")).toBe("completed");
    expect(nextDispatchStatus("requested")).toBeNull();
    expect(canTransitionEmergencyRequest("assigned", "arrived")).toBe(false);
    expect(canTransitionEmergencyRequest("assigned", "en-route")).toBe(true);
  });

  it("limits citizen cancellation to requests that have not reached the responder", () => {
    expect(canCancelEmergencyRequest("requested")).toBe(true);
    expect(canCancelEmergencyRequest("assigned")).toBe(true);
    expect(canCancelEmergencyRequest("en-route")).toBe(false);
  });

  it("validates complete coordinates and bounded assignment ETAs", () => {
    const baseRequest = {
      serviceCode: "towing",
      contactPhone: "9876543210",
      vehicleType: "car",
      location: { description: "Near the north entrance of Central Station" },
      safetyStatus: "safe",
    };
    expect(emergencyRequestSchema.safeParse(baseRequest).success).toBe(true);
    expect(emergencyRequestSchema.safeParse({
      ...baseRequest,
      location: { ...baseRequest.location, latitude: 17.4 },
    }).success).toBe(false);
    expect(emergencyAssignmentSchema.safeParse({
      unitName: "Recovery unit 4",
      unitPhone: "9876543210",
      etaMinutes: 0,
    }).success).toBe(false);
  });

  it("creates a public request reference and initial audit event before persistence", async () => {
    const ownerId = new mongoose.Types.ObjectId();
    const request = new EmergencyRequest({
      userId: ownerId,
      serviceCode: "towing",
      serviceName: "Towing and recovery",
      contactPhone: "9876543210",
      vehicleType: "car",
      location: { description: "Near Central Station north entrance" },
      safetyStatus: "safe",
      priority: "standard",
    });
    await request.validate();
    expect(request.requestId).toMatch(/^EMR-[A-Z0-9]{8}$/);
    expect(request.statusHistory[0]).toMatchObject({ status: "requested", actorId: ownerId });
  });

  it("defines indexes for citizen history and dispatch queue ordering", () => {
    const indexes = EmergencyRequest.schema.indexes();
    expect(indexes.some(([fields]) => fields.status === 1 && fields.priority === 1 && fields.createdAt === 1)).toBe(true);
    expect(indexes.some(([fields]) => fields.userId === 1 && fields.createdAt === -1)).toBe(true);
  });

  it("preserves the trusted active-status filter with query sanitization", () => {
    const filter = { status: trustedActiveEmergencyStatuses() };
    mongoose.sanitizeFilter(filter);
    expect(filter.status.$in).toEqual(["requested", "assigned", "en-route", "arrived"]);
    expect(filter.status.$eq).toBeUndefined();
  });
});