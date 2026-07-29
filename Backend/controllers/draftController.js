import { COMPANION_SERVICES } from "../data/companionServices.js";
import { DRAFT_TEMPLATES, draftTemplate } from "../data/draftTemplates.js";
import ReadinessChecklist from "../models/ReadinessChecklist.js";
import ServiceDraft from "../models/ServiceDraft.js";
import { generateServiceDraft } from "../services/draftGenerationService.js";
import { renderDraftPdf } from "../services/draftPdfService.js";

const serviceByCode = (code) => COMPANION_SERVICES.find(({ serviceCode }) => serviceCode === code);
const output = (item) => ({
  draftId: item.draftId,
  readinessId: item.readinessId,
  serviceCode: item.serviceCode,
  serviceTitle: item.serviceTitle,
  draftType: item.draftType,
  recipient: item.recipient,
  subject: item.subject,
  facts: item.facts,
  chronology: item.chronology,
  requestedOutcome: item.requestedOutcome,
  referenceLabel: item.referenceLabel,
  signerName: item.signerName,
  content: item.content,
  mode: item.mode,
  model: item.model,
  revision: item.revision,
  status: item.status,
  finalizedAt: item.finalizedAt,
  archivedAt: item.archivedAt,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const verifyReadiness = async ({ readinessId, serviceCode, userId }) => {
  if (!readinessId) return null;
  return ReadinessChecklist.findOne({ checklistId: readinessId, userId, serviceCode, status: { $ne: "archived" } });
};

export const listDraftTemplates = (_req, res) => res.json({
  templates: COMPANION_SERVICES.map(({ serviceCode, title }) => ({
    serviceCode,
    serviceTitle: title,
    recipient: DRAFT_TEMPLATES[serviceCode].recipient,
    types: DRAFT_TEMPLATES[serviceCode].types,
  })),
});

export const createDraft = async (req, res) => {
  const service = serviceByCode(req.body.serviceCode);
  const template = draftTemplate(req.body.serviceCode, req.body.draftType);
  if (!service || !template) return res.status(404).json({ error: "Reviewed draft template not found." });
  if (req.body.readinessId && !await verifyReadiness({ ...req.body, userId: req.user.userId })) {
    return res.status(422).json({ error: "Choose an active readiness checklist that belongs to this service." });
  }
  const input = { ...req.body, recipient: req.body.recipient || template.recipient };
  const generated = await generateServiceDraft({ input, userId: req.user.userId });
  const item = await ServiceDraft.create({
    ...input,
    userId: req.user.userId,
    serviceTitle: service.title,
    ...generated,
  });
  return res.status(201).json({ message: "Draft created. It has not been submitted.", draft: output(item) });
};

export const listMyDrafts = async (req, res) => {
  const items = await ServiceDraft.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(50);
  return res.json({ drafts: items.map(output) });
};

export const getMyDraft = async (req, res) => {
  const item = await ServiceDraft.findOne({ draftId: req.params.draftId, userId: req.user.userId });
  if (!item) return res.status(404).json({ error: "Draft not found." });
  return res.json({ draft: output(item) });
};

export const reviseDraft = async (req, res) => {
  const item = await ServiceDraft.findOne({ draftId: req.params.draftId, userId: req.user.userId });
  if (!item) return res.status(404).json({ error: "Draft not found." });
  if (item.status !== "draft") return res.status(409).json({ error: "Only active drafts can be revised." });
  const template = draftTemplate(req.body.serviceCode, req.body.draftType);
  const service = serviceByCode(req.body.serviceCode);
  if (!template || !service) return res.status(404).json({ error: "Reviewed draft template not found." });
  if (req.body.readinessId && !await verifyReadiness({ ...req.body, userId: req.user.userId })) {
    return res.status(422).json({ error: "Choose an active readiness checklist that belongs to this service." });
  }
  const input = { ...req.body, recipient: req.body.recipient || template.recipient };
  const generated = await generateServiceDraft({ input, userId: req.user.userId });
  Object.assign(item, input, generated, { serviceTitle: service.title, revision: item.revision + 1 });
  await item.save();
  return res.json({ message: "Draft revised. Review it again before use.", draft: output(item) });
};

export const finalizeDraft = async (req, res) => {
  const item = await ServiceDraft.findOne({ draftId: req.params.draftId, userId: req.user.userId });
  if (!item) return res.status(404).json({ error: "Draft not found." });
  if (item.status !== "draft") return res.status(409).json({ error: "Only active drafts can be finalized." });
  item.status = "finalized";
  item.finalizedAt = new Date();
  await item.save();
  return res.json({ message: "Draft locked for download. This does not submit it.", draft: output(item) });
};

export const archiveDraft = async (req, res) => {
  const item = await ServiceDraft.findOne({ draftId: req.params.draftId, userId: req.user.userId });
  if (!item) return res.status(404).json({ error: "Draft not found." });
  if (item.status === "archived") return res.status(409).json({ error: "Draft is already archived." });
  item.status = "archived";
  item.archivedAt = new Date();
  await item.save();
  return res.json({ message: "Draft archived.", draft: output(item) });
};

export const downloadDraftPdf = async (req, res) => {
  const item = await ServiceDraft.findOne({ draftId: req.params.draftId, userId: req.user.userId, status: { $ne: "archived" } });
  if (!item) return res.status(404).json({ error: "Active draft not found." });
  const pdf = await renderDraftPdf(item);
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${item.draftId.toLowerCase()}.pdf"`,
    "Cache-Control": "private, no-store",
    "Content-Length": pdf.length,
  });
  return res.send(pdf);
};
