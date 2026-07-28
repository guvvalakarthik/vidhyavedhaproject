import { z } from "zod";

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