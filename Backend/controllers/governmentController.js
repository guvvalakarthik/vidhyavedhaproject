import Application from "../models/Application.js";
import User from "../models/User.js";
import { GOVERNMENT_SERVICE_CATALOG } from "../data/governmentServices.js";

const serviceByCode = (serviceCode) =>
  GOVERNMENT_SERVICE_CATALOG.find((service) => service.serviceCode === serviceCode);

const publicService = ({ searchTags, ...service }) => service;

const publicRequest = (application) => ({
  requestId: application.applicationId,
  serviceCode: application.details?.serviceCode,
  serviceName: application.serviceType,
  supportMode: application.details?.supportMode,
  district: application.details?.district,
  preferredLanguage: application.details?.preferredLanguage,
  notes: application.details?.notes || "",
  status: application.status,
  submittedAt: application.createdAt,
  updatedAt: application.updatedAt,
});

export const listGovernmentServices = (_req, res) =>
  res.json({ services: GOVERNMENT_SERVICE_CATALOG.map(publicService) });

export const getGovernmentService = (req, res) => {
  const service = serviceByCode(req.params.serviceCode);
  if (!service) return res.status(404).json({ error: "Government service not found." });
  return res.json({ service: publicService(service) });
};

export const createGovernmentAssistanceRequest = async (req, res) => {
  const service = serviceByCode(req.body.serviceCode);
  if (!service) return res.status(404).json({ error: "Government service not found." });

  const user = await User.findById(req.user.userId).lean();
  if (!user) return res.status(404).json({ error: "User account not found." });

  const { phone, supportMode, district, preferredLanguage, notes = "" } = req.body;
  const application = await Application.create({
    userId: user._id,
    category: "government",
    serviceType: service.name,
    name: user.name,
    email: user.email,
    phone,
    details: {
      serviceCode: service.serviceCode,
      authority: service.authority,
      officialUrl: service.officialUrl,
      supportMode,
      district,
      preferredLanguage,
      notes,
      scope: "assisted-guidance",
    },
  });

  return res.status(201).json({
    message: "Assisted support request received.",
    request: publicRequest(application),
  });
};

export const listMyGovernmentRequests = async (req, res) => {
  const requests = await Application.find({
    category: "government",
    userId: req.user.userId,
  }).sort({ createdAt: -1 });
  return res.json({ requests: requests.map(publicRequest) });
};

export const cancelGovernmentRequest = async (req, res) => {
  const request = await Application.findOne({
    applicationId: req.params.applicationId,
    category: "government",
    userId: req.user.userId,
  });
  if (!request) return res.status(404).json({ error: "Support request not found." });
  if (!["pending", "under-review"].includes(request.status)) {
    return res.status(409).json({ error: "This support request can no longer be cancelled online." });
  }

  await Application.deleteOne({ _id: request._id });
  return res.json({ message: "Support request cancelled." });
};