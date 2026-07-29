import HealthcareAppointment from "../models/HealthcareAppointment.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import HomeServiceBooking from "../models/HomeServiceBooking.js";
import HandoffRequest from "../models/HandoffRequest.js";

export const operationalRecord = (kind, item) => {
  if (kind === "healthcare") return { id: item.confirmationCode, kind, status: item.status, service: item.specialty, scheduledAt: item.startTime, area: item.location?.city || "" };
  if (kind === "emergency") return { id: item.requestId, kind, status: item.status, service: item.serviceName, priority: item.priority, scheduledAt: item.createdAt, area: item.location?.description ? "Location shared with dispatch record" : "" };
  if (kind === "home") return { id: item.bookingCode, kind, status: item.status, service: item.service, scheduledAt: item.startTime, area: item.serviceArea };
  return { id: item.handoffId, kind: "handoff", status: item.status, service: item.serviceCode, scheduledAt: item.createdAt, area: item.centreCode };
};

export const getProviderOperations = async () => {
  const now = new Date();
  const [healthcare, emergency, home, handoffs, healthcareCounts, emergencyCounts, homeCounts, handoffCounts] = await Promise.all([
    HealthcareAppointment.find({ status: "booked", startTime: { $gte: now } }).sort({ startTime: 1 }).limit(20),
    EmergencyRequest.find({ status: { $in: ["requested", "assigned", "en-route", "arrived"] } }).sort({ priority: -1, createdAt: 1 }).limit(20),
    HomeServiceBooking.find({ status: "booked", startTime: { $gte: now } }).sort({ startTime: 1 }).limit(20),
    HandoffRequest.find({ status: { $in: ["requested", "assigned", "contacted"] } }).sort({ createdAt: 1 }).limit(20),
    HealthcareAppointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    EmergencyRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    HomeServiceBooking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    HandoffRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  const counts = (rows) => Object.fromEntries(rows.map(({ _id, count }) => [_id, count]));
  return {
    generatedAt: now,
    metrics: { healthcare: counts(healthcareCounts), emergency: counts(emergencyCounts), home: counts(homeCounts), handoffs: counts(handoffCounts) },
    queues: {
      healthcare: healthcare.map((item) => operationalRecord("healthcare", item)),
      emergency: emergency.map((item) => operationalRecord("emergency", item)),
      home: home.map((item) => operationalRecord("home", item)),
      handoffs: handoffs.map((item) => operationalRecord("handoff", item)),
    },
    privacyBoundary: "Operational queues exclude resident names, phone numbers, reasons, notes, document data, and precise emergency locations.",
  };
};
