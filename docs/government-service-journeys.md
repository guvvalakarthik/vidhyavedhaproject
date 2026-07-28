# Government service journeys

The government-services area is a guidance and assisted-support layer. It helps residents identify the responsible authority, understand the process, prepare likely documents, and continue to the official government service. It does not issue documents, submit official applications, guarantee approval, or replace an issuing authority.

## Trust boundary

- Public guidance names the responsible authority and links directly to its official service.
- Vidhya Vedha never asks for Aadhaar, PAN, passport, voter or driving-licence numbers.
- Document checklist selections stay in the browser and are not uploaded.
- Assisted support collects only a service code, support channel, district or city, preferred language, contact number, optional guidance note, and explicit acknowledgement of the support scope.
- Applications, payments, appointments and official status remain with the issuing authority.

## Supported guidance

The curated catalogue currently covers:

- Aadhaar enrolment and updates through UIDAI.
- Passport services through Passport Seva.
- Voter registration and electoral services through the Election Commission of India.
- Driving licence services through Sarathi.
- State and local certificate discovery through the National Government Services Portal.
- Authentic issued digital documents through DigiLocker.

Catalogue content is maintained in `Backend/data/governmentServices.js`. Review official links and guidance periodically because requirements, fees and service availability can change.

## API routes

Public routes:

- `GET /api/government/services` lists curated service guidance.
- `GET /api/government/services/:serviceCode` returns one service guide.

Authenticated resident routes:

- `POST /api/government/requests` creates an assisted-guidance request.
- `GET /api/government/requests/mine` lists the signed-in resident's government support requests.
- `DELETE /api/government/requests/:applicationId` cancels an owned pending or under-review support request.

Support requests use the existing application model so administrators can review them through current operational tooling. In the resident experience, generic application statuses are translated into support-language labels such as “Request received”, “Being reviewed” and “Support completed”.

## Design references

The journey follows patterns visible in official public services:

- [National Government Services Portal](https://services.india.gov.in/) for searchable category-based discovery.
- [Passport Seva](https://www.passportindia.gov.in/psp/) for document advice, explicit steps, appointments and status tracking.
- [Voters’ Services Portal](https://voters.eci.gov.in/) for task-based services and application tracking.
- [DigiLocker](https://www.digilocker.gov.in/) for a clear distinction between authentic issued documents and user-provided files.
- [GOV.UK start-page guidance](https://design-system.service.gov.uk/patterns/start-using-a-service/), [question pages](https://design-system.service.gov.uk/patterns/question-pages/) and [check answers](https://design-system.service.gov.uk/patterns/check-answers/) for focused, confidence-building transactions.

## Production follow-up

Before a production launch, assign catalogue ownership, review every official link on a schedule, add state and district routing, define support-team service levels, retain status-change history, and publish a clear privacy and records-retention policy for assistance requests.