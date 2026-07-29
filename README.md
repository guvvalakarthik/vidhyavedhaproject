# Vidhya Vedha

Vidhya Vedha is a full-stack civic and local-services platform for rural communities. The current rebuild is moving the product from generic request forms toward task-specific journeys such as appointment scheduling, assisted government-service handoffs, bookings, dispatch, and status tracking.

## Technology

- Frontend: React 19, Vite 8, React Router, Axios
- Frontend tests: Vitest, Testing Library, jsdom
- Backend: Express 5, MongoDB, Mongoose
- Authentication: MongoDB-backed opaque cookie sessions with CSRF protection, role-based authorization, and ownership checks

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
- OPENAI_API_KEY: optional API key that enables generated multilingual answers.
- OPENAI_MODEL: Responses API model, defaulting to gpt-5.6-sol.
- `AI_CONVERSATION_RETENTION_DAYS`: owner conversation retention, defaulting to `90` days.
- `PORT`: API port, defaulting to `5000`.

Never commit real credentials or personal service data.
