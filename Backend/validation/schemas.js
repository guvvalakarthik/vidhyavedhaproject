import { z } from "zod";
import { GOVERNMENT_SERVICE_CODES } from "../data/governmentServices.js";
import { EMERGENCY_SERVICE_CODES } from "../data/emergencyServices.js";
import {
  EDUCATION_LEARNER_STAGES,
  EDUCATION_PATHWAY_CODES,
} from "../data/educationPathways.js";
import { FINANCIAL_PATHWAY_CODES } from "../data/financialPathways.js";

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

export const aiAskSchema = z.object({
  message: z.string().trim().min(2).max(1200),
  service: z.enum(["all", "government", "education", "finance", "healthcare", "emergency"]).default("all"),
  language: z.enum(["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi"]).default("English"),
}).strict();

export const aiConversationSchema = z.object({
  title: z.string().trim().min(2).max(100).optional(),
  service: z.enum(["all", "government", "education", "finance", "healthcare", "emergency"]).default("all"),
  language: z.enum(["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi"]).default("English"),
}).strict();

export const aiMessageSchema = z.object({
  message: z.string().trim().min(2).max(1200),
}).strict();

export const agentActionParamsSchema = z.object({
  actionId: z.string().trim().regex(/^ACT-[A-Z0-9]{8}$/i).transform((value) => value.toUpperCase()),
});
