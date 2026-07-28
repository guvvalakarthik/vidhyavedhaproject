import HealthcareAppointment from "../models/HealthcareAppointment.js";
import HealthcareProvider from "../models/HealthcareProvider.js";
import User from "../models/User.js";
import {
  buildAvailableSlots,
  canModifyAppointment,
  dateInIndia,
  findBookableSlot,
  HEALTHCARE_TIME_ZONE,
} from "../services/healthcareSchedulingService.js";

const duplicateBookingResponse = (res) => res.status(409).json({
  error: "That appointment time has just been booked. Please choose another available slot.",
  code: "SLOT_UNAVAILABLE",
});

const publicProvider = (provider) => ({
  providerCode: provider.providerCode,
  name: provider.name,
  specialty: provider.specialty,
  qualifications: provider.qualifications,
  experienceYears: provider.experienceYears,
  languages: provider.languages,
  modes: provider.modes,
  location: provider.location,
  consultationMinutes: provider.consultationMinutes,
});

const publicAppointment = (appointment) => ({
  confirmationCode: appointment.confirmationCode,
  providerCode: appointment.providerCode,
  providerName: appointment.providerName,
  specialty: appointment.specialty,
  location: appointment.location,
  mode: appointment.mode,
  patientName: appointment.patientName,
  phone: appointment.phone,
  reason: appointment.reason,
  startTime: appointment.startTime,
  endTime: appointment.endTime,
  status: appointment.status,
  cancelledAt: appointment.cancelledAt,
  rescheduleHistory: appointment.rescheduleHistory,
  createdAt: appointment.createdAt,
});

export const listHealthcareProviders = async (_req, res) => {
  const providers = await HealthcareProvider.find({ active: true }).sort({ specialty: 1, name: 1 }).lean();
  return res.json({ providers: providers.map(publicProvider), timeZone: HEALTHCARE_TIME_ZONE });
};

export const getProviderAvailability = async (req, res) => {
  const { providerCode } = req.params;
  const { from = dateInIndia(), days = 7 } = req.validated?.query || req.query;
  const provider = await HealthcareProvider.findOne({ providerCode, active: true }).lean();
  if (!provider) return res.status(404).json({ error: "Healthcare provider not found." });

  const candidateSlots = buildAvailableSlots({ provider, fromDate: from, days });
  if (candidateSlots.length === 0) {
    return res.json({ provider: publicProvider(provider), slots: [], from, days, timeZone: HEALTHCARE_TIME_ZONE });
  }

  const firstStart = new Date(candidateSlots[0].start);
  const lastStart = new Date(candidateSlots[candidateSlots.length - 1].start);
  const booked = await HealthcareAppointment.find({
    providerCode,
    status: "booked",
    startTime: { $gte: firstStart, $lte: lastStart },
  }).select("startTime").lean();
  const bookedStarts = new Set(booked.map((appointment) => new Date(appointment.startTime).getTime()));
  const slots = buildAvailableSlots({ provider, fromDate: from, days, bookedStarts });

  return res.json({ provider: publicProvider(provider), slots, from, days, timeZone: HEALTHCARE_TIME_ZONE });
};

export const bookHealthcareAppointment = async (req, res) => {
  const { providerCode, startTime, mode, phone, reason } = req.body;
  const provider = await HealthcareProvider.findOne({ providerCode, active: true }).lean();
  if (!provider) return res.status(404).json({ error: "Healthcare provider not found." });
  if (!provider.modes.includes(mode)) {
    return res.status(422).json({ error: "The selected consultation mode is not available for this provider." });
  }

  const slot = findBookableSlot({ provider, startTime });
  if (!slot) return res.status(422).json({ error: "Choose a current appointment slot from this provider’s availability." });

  const user = await User.findById(req.user.userId).lean();
  if (!user) return res.status(404).json({ error: "User account not found." });

  try {
    const appointment = await HealthcareAppointment.create({
      userId: user._id,
      providerId: provider._id,
      providerCode: provider.providerCode,
      providerName: provider.name,
      specialty: provider.specialty,
      location: provider.location,
      mode,
      patientName: user.name,
      patientEmail: user.email,
      phone,
      reason,
      startTime: new Date(slot.start),
      endTime: new Date(slot.end),
    });
    return res.status(201).json({
      message: "Appointment booked successfully.",
      appointment: publicAppointment(appointment),
    });
  } catch (error) {
    if (error?.code === 11000) return duplicateBookingResponse(res);
    throw error;
  }
};

export const listMyHealthcareAppointments = async (req, res) => {
  const appointments = await HealthcareAppointment.find({ userId: req.user.userId }).sort({ startTime: 1 });
  return res.json({ appointments: appointments.map(publicAppointment), timeZone: HEALTHCARE_TIME_ZONE });
};

export const cancelHealthcareAppointment = async (req, res) => {
  const appointment = await HealthcareAppointment.findOne({
    confirmationCode: req.params.confirmationCode,
    userId: req.user.userId,
  });
  if (!appointment) return res.status(404).json({ error: "Appointment not found." });
  if (!canModifyAppointment(appointment)) {
    return res.status(409).json({ error: "This appointment cannot be cancelled online within 2 hours of its start time. Contact the clinic." });
  }

  appointment.status = "cancelled";
  appointment.cancelledAt = new Date();
  await appointment.save();
  return res.json({ message: "Appointment cancelled.", appointment: publicAppointment(appointment) });
};

export const rescheduleHealthcareAppointment = async (req, res) => {
  const appointment = await HealthcareAppointment.findOne({
    confirmationCode: req.params.confirmationCode,
    userId: req.user.userId,
  });
  if (!appointment) return res.status(404).json({ error: "Appointment not found." });
  if (!canModifyAppointment(appointment)) {
    return res.status(409).json({ error: "This appointment cannot be changed online within 2 hours of its start time. Contact the clinic." });
  }

  const provider = await HealthcareProvider.findOne({ providerCode: appointment.providerCode, active: true }).lean();
  if (!provider) return res.status(409).json({ error: "This provider is no longer available for online booking." });
  const slot = findBookableSlot({ provider, startTime: req.body.startTime });
  if (!slot) return res.status(422).json({ error: "Choose a current appointment slot from this provider’s availability." });
  if (new Date(slot.start).getTime() === appointment.startTime.getTime()) {
    return res.status(409).json({ error: "Choose a different appointment time." });
  }

  appointment.rescheduleHistory.push({ startTime: appointment.startTime, endTime: appointment.endTime });
  appointment.startTime = new Date(slot.start);
  appointment.endTime = new Date(slot.end);
  try {
    await appointment.save();
    return res.json({ message: "Appointment rescheduled.", appointment: publicAppointment(appointment) });
  } catch (error) {
    if (error?.code === 11000) return duplicateBookingResponse(res);
    throw error;
  }
};