# Home Maintenance booking

Home Maintenance is a provider-and-slot booking journey rather than a generic request form. Users can browse service partners, load current seven-day availability, reserve one visit and manage or cancel their own bookings.

## Demonstration catalogue

`Backend/data/homeServiceProviders.js` contains four explicitly labelled `Vidhya Partner` demonstration providers for electrical, plumbing, appliance and carpentry visits. These are product fixtures, not claims about real businesses. Production deployment must replace them with contracted, identity-checked local providers, service areas, prices, terms and operational schedules.

## Booking rules

- Slots use the `Asia/Kolkata` time zone.
- A booking must match a currently generated provider slot and listed service area.
- A partial unique database index on active `providerCode + startTime` prevents two users from holding the same visit.
- Duplicate races return HTTP 409 with `SLOT_UNAVAILABLE`.
- Reads and mutations are owner-scoped.
- Online cancellation closes two hours before the visit.
- The page collects a service area, contact phone and short issue summary, not a full street address, door/access code or payment.

## API

- `GET /api/home-maintenance/providers`
- `GET /api/home-maintenance/providers/:providerCode/availability?from=YYYY-MM-DD&days=7`
- `POST /api/home-maintenance/bookings` (authenticated and CSRF-protected)
- `GET /api/home-maintenance/bookings/mine` (authenticated)
- `PATCH /api/home-maintenance/bookings/:bookingCode/cancel` (owner only)

Before production, add provider onboarding and verification, coverage/pricing rules, provider acceptance, notifications, rescheduling, audit logging and operational dispute handling.
