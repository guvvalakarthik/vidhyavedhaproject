import { z } from "zod";
import { GOVERNMENT_SERVICE_CODES } from "../data/governmentServices.js";
import { EMERGENCY_SERVICE_CODES } from "../data/emergencyServices.js";
import {
  EDUCATION_LEARNER_STAGES,
  EDUCATION_PATHWAY_CODES,
} from "../data/educationPathways.js";
import { FINANCIAL_PATHWAY_CODES } from "../data/financialPathways.js";
import { FARMING_PATHWAY_CODES, FARMING_SEASONS } from "../data/farmingPathways.js";
import { UTILITY_GUIDE_CODES } from "../data/utilityGuides.js";
import { COMMERCE_GUIDE_CODES, COMMERCE_OUTCOMES } from "../data/commerceGuides.js";
import { HOME_PROVIDER_CODES } from "../data/homeServiceProviders.js";
import { COMPANION_DOMAINS, COMPANION_GOALS, COMPANION_LANGUAGES, COMPANION_LIFE_STAGES, COMPANION_SERVICE_CODES, COMPANION_URGENCY } from "../data/companionServices.js";
import { READINESS_ITEM_STATUSES } from "../data/readinessTemplates.js";
import { DRAFT_TYPES } from "../data/draftTemplates.js";
import { REMINDER_CADENCES, REMINDER_SOURCE_TYPES } from "../models/Reminder.js";
import { STATUS_PROVIDER_CODES } from "../data/statusProviders.js";
import { ASSISTANCE_CENTRE_CODES } from "../data/assistanceCentres.js";

export const roles = ["citizen", "provider", "dispatcher", "admin"];
export const categories = [
  "education", "emergency", "banking", "healthcare", "farming",
  "utilities", "ecommerce", "home-maintenance", "government", "contact",
];
export const applicationStatuses = ["pending", "under-review", "approved", "rejected"];

const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().min(8).max(128);
const phone = z.string().trim().regex(/^[0-9+()\-\s]{7,20}$/, "Enter a valid phone number.");
const dateText = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format.").refine((value) => {
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}, "Enter a valid calendar date.");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email,
  password,
  confirmPassword: z.string().max(128).optional(),
}).refine((data) => data.confirmPassword === undefined || data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });

export const applicationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: email.optional(),
  phone: z.string().trim().refine(
    (value) => value === "N/A" || /^[0-9+()\-\s]{7,20}$/.test(value),
    "Enter a valid phone number.",
  ),
  serviceType: z.string().trim().min(2).max(160),
}).passthrough();

export const applicationUpdateSchema = applicationSchema.partial();
export const statusUpdateSchema = z.object({ status: z.enum(applicationStatuses) });
export const categoryParamsSchema = z.object({ category: z.enum(categories) });
export const applicationIdParamsSchema = z.object({
  applicationId: z.string().trim().min(6).max(80).regex(/^[A-Z0-9-]+$/i),
});

export const providerCodeParamsSchema = z.object({
  providerCode: z.string().trim().min(5).max(80).regex(/^[A-Z0-9-]+$/i).transform((value) => value.toUpperCase()),
});
export const appointmentCodeParamsSchema = z.object({
  confirmationCode: z.string().trim().regex(/^APT-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()),
});
export const availabilityQuerySchema = z.object({
  from: dateText.optional(),
  days: z.coerce.number().int().min(1).max(14).default(7),
});
export const appointmentBookingSchema = z.object({
  providerCode: z.string().trim().min(5).max(80).regex(/^[A-Z0-9-]+$/i).transform((value) => value.toUpperCase()),
  startTime: z.string().datetime({ offset: true }),
  mode: z.enum(["in-person", "video"]),
  phone,
  reason: z.string().trim().min(3).max(500),
});
export const appointmentRescheduleSchema = z.object({
  startTime: z.string().datetime({ offset: true }),
});
export const governmentServiceParamsSchema = z.object({
  serviceCode: z.enum(GOVERNMENT_SERVICE_CODES),
});
export const governmentAssistanceSchema = z.object({
  serviceCode: z.enum(GOVERNMENT_SERVICE_CODES),
  supportMode: z.enum(["digital-guidance", "phone-guidance", "centre-visit-guidance"]),
  district: z.string().trim().min(2).max(100),
  preferredLanguage: z.enum(["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi", "Other"]),
  phone,
  notes: z.string().trim().max(500).optional().default(""),
  consent: z.literal(true),
});

const coordinates = z.object({
  description: z.string().trim().min(5).max(300),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
}).refine(
  (value) => (value.latitude === undefined) === (value.longitude === undefined),
  { message: "Latitude and longitude must be provided together." },
);

export const emergencyRequestIdParamsSchema = z.object({
  requestId: z.string().trim().regex(/^EMR-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()),
});
export const emergencyRequestSchema = z.object({
  serviceCode: z.enum(EMERGENCY_SERVICE_CODES),
  contactPhone: phone,
  vehicleType: z.enum(["car", "motorcycle", "auto-rickshaw", "van", "commercial", "other"]),
  vehicleDescription: z.string().trim().max(160).optional().default(""),
  location: coordinates,
  safetyStatus: z.enum(["safe", "roadside-risk"]),
  notes: z.string().trim().max(500).optional().default(""),
});
export const emergencyAssignmentSchema = z.object({
  unitName: z.string().trim().min(2).max(120),
  unitPhone: phone,
  etaMinutes: z.coerce.number().int().min(1).max(240),
});
export const emergencyStatusSchema = z.object({
  status: z.enum(["en-route", "arrived", "completed"]),
});
export const educationPathwayParamsSchema = z.object({
  pathwayCode: z.enum(EDUCATION_PATHWAY_CODES),
});
export const educationPlanParamsSchema = z.object({
  planId: z.string().trim().regex(/^EDU-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()),
});
export const educationPlanTaskParamsSchema = educationPlanParamsSchema.extend({
  taskId: z.string().trim().min(3).max(80).regex(/^[a-z0-9-]+$/),
});
export const educationPlanSchema = z.object({
  pathwayCode: z.enum(EDUCATION_PATHWAY_CODES),
  learnerStage: z.enum(EDUCATION_LEARNER_STAGES),
  target: z.string().trim().max(160).optional().default(""),
  targetCycle: z.enum(["current-cycle", "next-cycle", "exploring"]),
});
export const educationTaskUpdateSchema = z.object({
  completed: z.boolean(),
});
export const financialPathwayParamsSchema = z.object({
  pathwayCode: z.enum(FINANCIAL_PATHWAY_CODES),
});
export const financialPlanParamsSchema = z.object({
  planId: z.string().trim().regex(/^FIN-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()),
});
export const financialPlanTaskParamsSchema = financialPlanParamsSchema.extend({
  taskId: z.string().trim().min(3).max(80).regex(/^[a-z0-9-]+$/),
});
export const financialPlanSchema = z.object({
  pathwayCode: z.enum(FINANCIAL_PATHWAY_CODES),
  target: z.string().trim().max(120).optional().default(""),
  planningHorizon: z.enum(["now", "within-three-months", "researching"]),
}).strict();
export const financialTaskUpdateSchema = z.object({
  completed: z.boolean(),
}).strict();


export const farmingPathwayParamsSchema = z.object({ pathwayCode: z.enum(FARMING_PATHWAY_CODES) });
export const farmingPlanParamsSchema = z.object({
  planId: z.string().trim().regex(/^FRM-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()),
});
export const farmingPlanTaskParamsSchema = farmingPlanParamsSchema.extend({
  taskId: z.string().trim().min(3).max(80).regex(/^[a-z0-9-]+$/),
});
export const farmingPlanSchema = z.object({
  pathwayCode: z.enum(FARMING_PATHWAY_CODES),
  crop: z.string().trim().max(80).optional().default(""),
  district: z.string().trim().max(100).optional().default(""),
  season: z.enum(FARMING_SEASONS),
}).strict();
export const farmingTaskUpdateSchema = z.object({
  completed: z.boolean(),
}).strict();
export const utilityGuideParamsSchema = z.object({ guideCode: z.enum(UTILITY_GUIDE_CODES) });
export const utilityIssueParamsSchema = z.object({
  issueId: z.string().trim().regex(/^UTL-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()),
});
export const utilityIssueTaskParamsSchema = utilityIssueParamsSchema.extend({
  taskId: z.string().trim().min(3).max(80).regex(/^[a-z0-9-]+$/),
});
export const utilityIssueSchema = z.object({
  guideCode: z.enum(UTILITY_GUIDE_CODES),
  providerLabel: z.string().trim().max(80).optional().default(""),
  referenceLabel: z.string().trim().max(60).optional().default(""),
  issueDate: dateText,
}).strict();
export const utilityTaskUpdateSchema = z.object({ completed: z.boolean() }).strict();
export const utilityIssueStatusSchema = z.object({ status: z.enum(["tracking", "resolved", "archived"]) }).strict();
export const commerceGuideParamsSchema = z.object({ guideCode: z.enum(COMMERCE_GUIDE_CODES) });
export const commerceCaseParamsSchema = z.object({ caseId: z.string().trim().regex(/^COM-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()) });
export const commerceCaseTaskParamsSchema = commerceCaseParamsSchema.extend({ taskId: z.string().trim().min(3).max(80).regex(/^[a-z0-9-]+$/) });
export const commerceCaseSchema = z.object({ guideCode: z.enum(COMMERCE_GUIDE_CODES), merchantLabel: z.string().trim().max(80).optional().default(""), orderLabel: z.string().trim().max(60).optional().default(""), incidentDate: dateText, desiredOutcome: z.enum(COMMERCE_OUTCOMES) }).strict();
export const commerceTaskUpdateSchema = z.object({ completed: z.boolean() }).strict();
export const commerceCaseStatusSchema = z.object({ status: z.enum(["open", "resolved", "archived"]) }).strict();
export const homeBookingCodeParamsSchema = z.object({ bookingCode: z.string().trim().regex(/^HOM-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()) });
export const homeBookingSchema = z.object({ providerCode: z.enum(HOME_PROVIDER_CODES), startTime: z.string().datetime({ offset: true }), serviceArea: z.string().trim().min(2).max(100), contactPhone: phone, issueSummary: z.string().trim().min(5).max(400) }).strict();
export const companionAssessmentParamsSchema = z.object({ assessmentId: z.string().trim().regex(/^CMP-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()) });
export const companionAssessmentSchema = z.object({
  goal: z.enum(COMPANION_GOALS), domain: z.enum(COMPANION_DOMAINS), lifeStage: z.enum(COMPANION_LIFE_STAGES), urgency: z.enum(COMPANION_URGENCY), language: z.enum(COMPANION_LANGUAGES),
  district: z.string().trim().max(100).optional().default(""), description: z.string().trim().max(500).optional().default(""),
}).strict();
export const readinessChecklistParamsSchema = z.object({ checklistId: z.string().trim().regex(/^RDY-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()) });
export const readinessItemParamsSchema = readinessChecklistParamsSchema.extend({ itemId: z.string().trim().min(3).max(80).regex(/^[a-z0-9-]+$/) });
export const readinessChecklistSchema = z.object({ serviceCode: z.enum(COMPANION_SERVICE_CODES), assessmentId: z.string().trim().regex(/^CMP-[A-Z0-9]{8}$/i).optional().default("") }).strict();
export const readinessItemUpdateSchema = z.object({ status: z.enum(READINESS_ITEM_STATUSES) }).strict();
export const draftIdParamsSchema = z.object({
  draftId: z.string().trim().regex(/^DRF-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()),
});
export const serviceDraftSchema = z.object({
  serviceCode: z.enum(COMPANION_SERVICE_CODES), draftType: z.enum(DRAFT_TYPES),
  readinessId: z.union([z.string().trim().regex(/^RDY-[A-Z0-9]{8}$/i), z.literal("")]).default(""),
  recipient: z.string().trim().max(160).optional().default(""),
  subject: z.string().trim().min(4).max(180),
  facts: z.string().trim().min(20).max(1800),
  chronology: z.string().trim().max(1200).optional().default(""),
  requestedOutcome: z.string().trim().min(10).max(800),
  referenceLabel: z.string().trim().max(100).optional().default(""),
  signerName: z.string().trim().max(120).optional().default(""),
  privacyAcknowledged: z.literal(true),
}).strict().transform(({ privacyAcknowledged: _privacyAcknowledged, ...draft }) => draft);
export const reminderIdParamsSchema = z.object({ reminderId: z.string().trim().regex(/^RMD-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()) });
export const reminderSchema = z.object({
  sourceType: z.enum(REMINDER_SOURCE_TYPES), sourceId: z.string().trim().max(20).optional().default(""),
  title: z.string().trim().min(4).max(180), dueAt: z.string().datetime({ offset: true }),
  cadence: z.enum(REMINDER_CADENCES), consent: z.literal(true),
}).strict().superRefine((value, context) => {
  const pattern = value.sourceType === "readiness" ? /^RDY-[A-Z0-9]{8}$/i : value.sourceType === "draft" ? /^DRF-[A-Z0-9]{8}$/i : null;
  if (pattern && !pattern.test(value.sourceId)) context.addIssue({ code: "custom", path: ["sourceId"], message: "Enter the owned task ID for this source." });
}).transform(({ consent: _consent, ...reminder }) => reminder);
export const reminderStatusSchema = z.object({ status: z.enum(["active", "paused", "completed", "archived"]) }).strict();
export const statusTrackerParamsSchema = z.object({ trackerId: z.string().trim().regex(/^TRK-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()) });
export const statusTrackerSchema = z.object({ providerCode: z.enum(STATUS_PROVIDER_CODES), targetId: z.string().trim().min(3).max(80) }).strict();

export const handoffParamsSchema=z.object({handoffId:z.string().trim().regex(/^HOF-[A-Z0-9]{8}$/i)});
export const handoffSchema=z.object({centreCode:z.enum(ASSISTANCE_CENTRE_CODES),serviceCode:z.enum(COMPANION_SERVICE_CODES),supportMode:z.enum(["phone","centre-visit"]),preferredLanguage:z.string().trim().min(2).max(40),phone,summary:z.string().trim().min(10).max(600),consent:z.literal(true)}).strict().transform(({consent:_consent,...x})=>x);
export const handoffUpdateSchema=z.object({status:z.enum(["assigned","contacted","resolved","cancelled"]),statusNote:z.string().trim().max(500).optional().default("")}).strict();
export const aiAskSchema = z.object({
  message: z.string().trim().min(2).max(1200),
  service: z.enum(["all", "government", "education", "finance", "farming", "utilities", "ecommerce", "home-maintenance", "healthcare", "emergency"]).default("all"),
  language: z.enum(["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi"]).default("English"),
}).strict();

export const aiConversationSchema = z.object({
  title: z.string().trim().min(2).max(100).optional(),
  service: z.enum(["all", "government", "education", "finance", "farming", "utilities", "ecommerce", "home-maintenance", "healthcare", "emergency"]).default("all"),
  language: z.enum(["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi"]).default("English"),
}).strict();

export const aiMessageSchema = z.object({
  message: z.string().trim().min(2).max(1200),
}).strict();

export const agentActionParamsSchema = z.object({
  actionId: z.string().trim().regex(/^ACT-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()),
});
