# Vidhya Vedha

Vidhya Vedha is a full-stack civic and local-services platform for rural communities. The current rebuild is moving the product from generic request forms toward task-specific journeys such as appointment scheduling, assisted government-service handoffs, bookings, dispatch, and status tracking.

## Technology

- Frontend: React 19, Vite 8, React Router, Axios
- Frontend tests: Vitest, Testing Library, jsdom
- Backend: Express 5, MongoDB, Mongoose
- Authentication: MongoDB-backed opaque cookie sessions with CSRF protection, role-based authorization, and ownership checks

## Engineering documentation

- [Architecture and trust boundaries](docs/architecture.md)
- [Threat model](docs/security/threat-model.md)
- [Deployment, verification and rollback](docs/deployment.md)
## Requirements

- Node.js 22.12 or newer
- MongoDB running locally or an accessible MongoDB connection string

## Local setup

Install frontend dependencies:

```powershell
npm install
```

Create the frontend environment file:

```powershell
Copy-Item .env.example .env
```

Start the frontend at `http://localhost:3000`:

```powershell
npm run dev
```

In a second terminal, install and start the API:

```powershell
Set-Location Backend
npm install
Copy-Item .env.example .env
npm run dev
```

The API listens on `http://localhost:5000` by default.

## Validation

```powershell
npm test
npm run build
npm audit --omit=dev
```

Backend checks:

```powershell
Set-Location Backend
npm test
npm audit --omit=dev
```

## Healthcare appointment scheduling

Healthcare now uses a task-specific scheduling journey instead of a generic service form. Residents can browse doctors and live availability, reserve a precise time, review upcoming appointments, reschedule, and cancel. The API prevents two users from taking the same provider slot.

Four sample providers are inserted automatically when the API starts. To reset the sample provider catalogue manually:

```powershell
Set-Location Backend
npm run seed:healthcare
```

See [Healthcare scheduling](docs/healthcare-scheduling.md) for the API routes, booking rules, and production considerations.

## Government service guidance

Government services now use a searchable, task-focused guidance journey instead of generic identity forms. Residents can review the responsible authority, official steps, likely documents, fees and processing caveats before continuing to an official portal. Signed-in residents can request minimum-data assisted guidance and track that support separately from the official application.

See [Government service journeys](docs/government-service-journeys.md) for trust boundaries, API routes, source references and production follow-up.

## Education action planning

Education now uses official-pathway discovery and a saved preparation checklist instead of generic exam, university and counselling application forms. Visitors can compare responsible authorities and continue to their official platforms. Signed-in learners can save an owner-scoped action plan, track each preparation step and archive completed or superseded plans without uploading marks, certificates or identity records.

See [Education pathway planning](docs/education-planning.md) for supported official routes, API endpoints and data boundaries.

## Financial guidance

Money and banking now uses verified official handoffs, a browser-only loan-cost calculator and owner-scoped preparation plans instead of collecting generic loan and insurance applications. It covers government credit, education finance, basic bank accounts, banking complaints, insurer checks and insurance grievances while keeping application, KYC, payment and evidence data with the responsible organisation.

See [Financial guidance and preparation plans](docs/financial-guidance.md) for the supported routes, calculator assumptions, API endpoints, data boundary and official references.

## Farming action planning

Farming now provides reviewed official pathways and private, owner-scoped preparation plans instead of generic benefit and market forms. Residents can explore Soil Health Card, PMFBY, e-NAM and PM-KISAN routes, save only optional crop and district labels plus a season, track checklist steps and archive finished plans. Identity, land, beneficiary, bank, claim and payment data stay with the responsible authority.

See [Farming pathway planning](docs/farming-planning.md) for the supported official routes, API endpoints, ownership controls and data boundary.
## Utility issue guidance

Utilities now replaces generic bill-payment, net-banking and recharge forms with reviewed electricity, telecom, LPG and consumer complaint routes. Signed-in residents can create an owner-scoped tracker using only safe labels, complete escalation steps, mark the issue resolved and archive it without sharing full account numbers, payments, passwords, PINs or OTPs.

See [Utility issue guidance and tracking](docs/utility-issue-tracking.md) for the official-route model, API and data boundary.
## Commerce consumer resolution

Ecommerce now provides reviewed resolution routes for marketplace refunds and non-delivery, suspicious digital payments, India Post issues and formal consumer escalation. Signed-in residents can save a minimal owner-scoped case, complete action steps, mark it resolved and archive it without sharing full order numbers, addresses, payment data, credentials or evidence.

See [Commerce consumer-resolution cases](docs/commerce-resolution.md) for the route catalogue, API and data boundary.
## Home Maintenance booking

Home Maintenance now supports demonstration-provider discovery, current slot loading, authenticated booking, owner-only visit history and confirmed cancellation. Active provider slots are protected by a database uniqueness constraint so concurrent users cannot reserve the same visit. The bundled Vidhya Partner records are clearly labelled product fixtures and must be replaced with contracted, verified local providers before production.

See [Home Maintenance booking](docs/home-maintenance-booking.md) for scheduling rules, API routes, collision handling and production requirements.
## Digital Companion service selection

Signed-in residents can now start with a goal, topic, life stage and urgency instead of guessing a department. The Companion ranks only the nine reviewed task-specific journeys, explains why each one fits, preserves service boundaries and saves owner-scoped guidance history. It works in reviewed rule-based mode without an API key and uses strict OpenAI structured output only to refine reviewed candidates when a key is configured.

See [AI-guided service selection](docs/digital-companion-selection.md) for the intake boundary, recommendation modes, API and safety controls.
## Personalized document readiness

Residents can create preparation checklists for every service journey, optionally personalized from a Digital Companion assessment. The app records only whether common, conditional or helpful items are ready; it does not upload documents or represent checklist items as official requirements.

See [Personalized document readiness](docs/document-readiness.md) for coverage, personalization, privacy boundaries, lifecycle and API routes.
## Grounded AI assistant

Signed-in residents can use Ask Vidhya for grounded guidance across government, education, finance, healthcare and roadside services. The assistant retrieves matching entries from the reviewed local catalogue, shows official sources and uses the OpenAI Responses API when a key is configured. Without a key it remains usable in verified catalogue mode. Owner-scoped conversation history preserves context across secure sessions, tightly scoped plan-task actions require explicit approval, and supported browsers offer multilingual speech input and answer playback.

See [Grounded AI assistant](docs/ai-assistant.md) for architecture, safety boundaries and configuration.
## Environment variables

Frontend (`.env`):

- `VITE_API_URL`: API base URL, defaulting to `http://localhost:5000/api`.

Backend (`Backend/.env`):

- `MONGO_URI`: MongoDB connection string.
- `SESSION_SECRET`: server-side session secret with at least 32 characters.
- `SESSION_IDLE_MINUTES`: inactivity timeout, defaulting to `30`.
- `SESSION_ABSOLUTE_HOURS`: maximum session lifetime, defaulting to `168`.
- MAX_SESSIONS_PER_USER: active device limit, defaulting to 5.
- `GOOGLE_CLIENT_ID`: Google Identity Services web client ID; public to the browser but configured by the API.
- OPENAI_API_KEY: optional API key that enables generated multilingual answers.
- OPENAI_MODEL: Responses API model, defaulting to gpt-5.6-sol.
- `AI_CONVERSATION_RETENTION_DAYS`: owner conversation retention, defaulting to `90` days.
- `PORT`: API port, defaulting to `5000`.

Never commit real credentials or personal service data.

## Google sign-in

Residents can sign in with Google's official button or keep using email/password. Google ID tokens are verified by the API and exchanged for the same HTTP-only, CSRF-protected Vidhya Vedha session.

See [Google sign-in setup](docs/google-sign-in.md) for authorized origins, configuration, account-linking rules, and the nonce-protected security flow.

## Service drafts and PDF

Authenticated residents can turn their own facts into application, complaint, service-request, or follow-up drafts, review a clearly marked preview, lock the reviewed version, and download an A4 PDF. Drafts are never submitted automatically, work without an AI key through reviewed templates, and can optionally use structured OpenAI rewriting.

See [`docs/service-drafts-and-pdf.md`](docs/service-drafts-and-pdf.md).
## Agentic reminders

Residents can explicitly enable in-app reminders for incomplete readiness checklists, unfinalized drafts, or a custom task. A bounded server worker evaluates due reminders, stops when linked work is complete, and never submits or changes the underlying service record.

See [`docs/agentic-reminders.md`](docs/agentic-reminders.md).

## Status connectors

Residents can track owned Vidhya records through working internal connectors. External authorities are shown as not connected until a reviewed official API adapter is registered, preventing fabricated status claims.

## Verified human handoff

Residents can request consent-based phone or centre guidance from the reviewed assisted-service directory. Provider and admin roles manage a separate assignment queue.

## Encrypted document vault

Owner-only PDF and image uploads are encrypted with AES-256-GCM before local storage. Upload/download requires explicit consent; revocation destroys ciphertext. Set DOCUMENT_ENCRYPTION_KEY to a base64-encoded 32-byte key.

See [`docs/encrypted-document-vault.md`](docs/encrypted-document-vault.md).

## Provider operations

Provider and admin roles receive a redacted, read-only dashboard for healthcare, roadside, home-service, and assisted-handoff operations. See [the dashboard notes](docs/provider-operations-dashboard.md).

## Privacy-safe blocker analytics

Residents report structured friction without free text or stored user IDs. Raw signals expire after 180 days and admin reports suppress groups below three events. See [the privacy design](docs/privacy-safe-blocker-analytics.md).
