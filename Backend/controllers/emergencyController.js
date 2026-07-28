import mongoose from "mongoose";
import { EMERGENCY_SERVICES } from "../data/emergencyServices.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import {
  ACTIVE_EMERGENCY_STATUSES,
  canCancelEmergencyRequest,
  canTransitionEmergencyRequest,
  priorityForSafety,
} from "../services/emergencyDispatchService.js";

const serviceByCode = new Map(EMERGENCY_SERVICES.map((service) => [service.code, service]));

const publicRequest = (request) => ({
  requestId: request.requestId,
  serviceCode: request.serviceCode,
  serviceName: request.serviceName,
  contactPhone: request.contactPhone,
  vehicleType: request.vehicleType,
  vehicleDescription: request.vehicleDescription,
  location: request.location,
  safetyStatus: request.safetyStatus,
  notes: request.notes,
  priority: request.priority,
  status: request.status,
  assignment: request.assignment?.unitName ? {
    unitName: request.assignment.unitName,
    unitPhone: request.assignment.unitPhone,
    etaMinutes: request.assignment.etaMinutes,
    assignedAt: request.assignment.assignedAt,
  } : null,
  statusHistory: request.statusHistory,
  cancelledAt: request.cancelledAt,
  completedAt: request.completedAt,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt,
});

export const trustedActiveEmergencyStatuses = () =>
  mongoose.trusted({ $in: ACTIVE_EMERGENCY_STATUSES });

export const listEmergencyServices = (_req, res) =>
  res.json({ services: EMERGENCY_SERVICES });

export const createEmergencyRequest = async (req, res) => {
  const service = serviceByCode.get(req.body.serviceCode);
  if (!service) return res.status(422).json({ error: "Choose an available roadside service." });

  const emergencyRequest = await EmergencyRequest.create({
    ...req.body,
    serviceName: service.name,
    userId: req.user.userId,
    priority: priorityForSafety(req.body.safetyStatus),
  });

  return res.status(201).json({
    message: "Roadside request sent to dispatch.",
    request: publicRequest(emergencyRequest),
  });
};

export const listMyEmergencyRequests = async (req, res) => {
  const requests = await EmergencyRequest.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  return res.json({ requests: requests.map(publicRequest) });
};

export const cancelEmergencyRequest = async (req, res) => {
  const current = await EmergencyRequest.findOne({
    requestId: req.params.requestId,
    userId: req.user.userId,
  });
  if (!current) return res.status(404).json({ error: "Roadside request not found." });
  if (!canCancelEmergencyRequest(current.status)) {
    return res.status(409).json({
      error: "This request can no longer be cancelled online. Contact the assigned unit if plans changed.",
    });
  }

  const now = new Date();
  const updated = await EmergencyRequest.findOneAndUpdate(
    { _id: current._id, status: current.status },
    {
      $set: { status: "cancelled", cancelledAt: now },
      $push: { statusHistory: { status: "cancelled", at: now, actorId: req.user.userId } },
    },
    { new: true },
  );
  if (!updated) return res.status(409).json({ error: "The request status changed. Refresh and try again." });

  return res.json({ message: "Roadside request cancelled.", request: publicRequest(updated) });
};

export const listDispatchQueue = async (_req, res) => {
  const requests = await EmergencyRequest.find({
    status: trustedActiveEmergencyStatuses(),
  }).sort({ priority: -1, createdAt: 1 });
  return res.json({ requests: requests.map(publicRequest) });
};

export const assignEmergencyRequest = async (req, res) => {
  const now = new Date();
  const updated = await EmergencyRequest.findOneAndUpdate(
    { requestId: req.params.requestId, status: "requested" },
    {
      $set: {
        status: "assigned",
        assignment: {
          dispatcherId: req.user.userId,
          unitName: req.body.unitName,
          unitPhone: req.body.unitPhone,
          etaMinutes: req.body.etaMinutes,
          assignedAt: now,
        },
      },
      $push: { statusHistory: { status: "assigned", at: now, actorId: req.user.userId } },
    },
    { new: true },
  );
  if (!updated) {
    const exists = await EmergencyRequest.exists({ requestId: req.params.requestId });
    return res.status(exists ? 409 : 404).json({
      error: exists ? "This request has already been assigned or closed." : "Roadside request not found.",
    });
  }
  return res.json({ message: "Response unit assigned.", request: publicRequest(updated) });
};

export const updateEmergencyStatus = async (req, res) => {
  const current = await EmergencyRequest.findOne({ requestId: req.params.requestId });
  if (!current) return res.status(404).json({ error: "Roadside request not found." });
  if (!canTransitionEmergencyRequest(current.status, req.body.status)) {
    return res.status(409).json({ error: `Cannot move a ${current.status} request to ${req.body.status}.` });
  }

  const now = new Date();
  const timestamps = req.body.status === "completed" ? { completedAt: now } : {};
  const updated = await EmergencyRequest.findOneAndUpdate(
    { _id: current._id, status: current.status },
    {
      $set: { status: req.body.status, ...timestamps },
      $push: { statusHistory: { status: req.body.status, at: now, actorId: req.user.userId } },
    },
    { new: true },
  );
  if (!updated) return res.status(409).json({ error: "The request status changed. Refresh and try again." });

  return res.json({ message: "Roadside request status updated.", request: publicRequest(updated) });
};