import express from "express";
import {
  bookHealthcareAppointment,
  cancelHealthcareAppointment,
  getProviderAvailability,
  listHealthcareProviders,
  listMyHealthcareAppointments,
  rescheduleHealthcareAppointment,
} from "../controllers/healthcareController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  appointmentBookingSchema,
  appointmentCodeParamsSchema,
  appointmentRescheduleSchema,
  availabilityQuerySchema,
  providerCodeParamsSchema,
} from "../validation/schemas.js";

const router = express.Router();

router.get("/providers", listHealthcareProviders);
router.get(
  "/providers/:providerCode/availability",
  validateRequest({ params: providerCodeParamsSchema, query: availabilityQuerySchema }),
  getProviderAvailability,
);
router.get("/appointments/mine", protect, listMyHealthcareAppointments);
router.post(
  "/appointments",
  protect,
  validateRequest({ body: appointmentBookingSchema }),
  bookHealthcareAppointment,
);
router.patch(
  "/appointments/:confirmationCode/cancel",
  protect,
  validateRequest({ params: appointmentCodeParamsSchema }),
  cancelHealthcareAppointment,
);
router.patch(
  "/appointments/:confirmationCode/reschedule",
  protect,
  validateRequest({ params: appointmentCodeParamsSchema, body: appointmentRescheduleSchema }),
  rescheduleHealthcareAppointment,
);

export default router;