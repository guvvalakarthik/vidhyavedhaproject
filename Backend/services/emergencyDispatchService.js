export const ACTIVE_EMERGENCY_STATUSES = ["requested", "assigned", "en-route", "arrived"];
export const EMERGENCY_STATUSES = [...ACTIVE_EMERGENCY_STATUSES, "completed", "cancelled"];

const DISPATCH_TRANSITIONS = {
  assigned: "en-route",
  "en-route": "arrived",
  arrived: "completed",
};

export const priorityForSafety = (safetyStatus) =>
  safetyStatus === "roadside-risk" ? "urgent" : "standard";

export const nextDispatchStatus = (status) => DISPATCH_TRANSITIONS[status] || null;

export const canCancelEmergencyRequest = (status) =>
  status === "requested" || status === "assigned";

export const canTransitionEmergencyRequest = (currentStatus, nextStatus) =>
  DISPATCH_TRANSITIONS[currentStatus] === nextStatus;