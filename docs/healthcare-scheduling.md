# Healthcare scheduling

The healthcare service is an appointment-scheduling workflow, not a generic request form. It supports provider discovery, live availability, atomic booking, resident-owned appointment management, rescheduling, and cancellation.

It is not a clinical triage or emergency service. The interface directs urgent cases to local emergency services instead of accepting them as routine bookings.

## Provider catalogue

The API inserts four sample providers on startup when their provider codes do not already exist. Existing provider records are preserved. For local development, the catalogue can be reset and reseeded with:

```powershell
Set-Location Backend
npm run seed:healthcare
```

These records are demonstration data. A production deployment should replace them with an authenticated administration workflow for provider onboarding, working hours, leave, service locations, and schedule changes.

## API routes

Public routes:

- `GET /api/healthcare/providers` lists active providers.
- `GET /api/healthcare/providers/:providerCode/availability` returns available slots. It accepts `from` as an ISO date and `days` from 1 to 14.

Authenticated resident routes:

- `POST /api/healthcare/appointments` books an exact available slot.
- `GET /api/healthcare/appointments/mine` lists the signed-in resident's appointments.
- `PATCH /api/healthcare/appointments/:confirmationCode/cancel` cancels an owned appointment.
- `PATCH /api/healthcare/appointments/:confirmationCode/reschedule` moves an owned appointment to another available slot.

## Booking rules

- All schedule calculations use `Asia/Kolkata`.
- A slot must match the provider's configured working schedule exactly.
- New appointments require at least 15 minutes of lead time.
- Residents can cancel or reschedule online until two hours before the appointment.
- Appointment reads and changes are restricted to the owning user.
- Partial unique database indexes prevent two active bookings for the same provider and start time, and prevent one resident from holding two active appointments at the same time.
- If another resident takes a slot before confirmation, the API responds with `409 SLOT_UNAVAILABLE`; the client refreshes availability instead of silently accepting a conflicting booking.

## Production follow-up

Before a real healthcare launch, add provider/admin schedule management, holiday and leave exceptions, reminder delivery, clinic-system integration, audit reporting, and an operational policy for staff-assisted changes inside the two-hour cutoff. Those capabilities are intentionally not claimed by the current resident scheduling workflow.