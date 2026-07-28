# Vidhya Vedha

Vidhya Vedha is a full-stack civic and local-services platform for rural communities. The current rebuild is moving the product from generic request forms toward task-specific journeys such as appointment scheduling, assisted government-service handoffs, bookings, dispatch, and status tracking.

## Technology

- Frontend: React 19, Vite 8, React Router, Axios
- Frontend tests: Vitest, Testing Library, jsdom
- Backend: Express 5, MongoDB, Mongoose
- Authentication: JWT-based API authentication with request validation, role-based authorization, and ownership checks

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

## Environment variables

Frontend (`.env`):

- `VITE_API_URL`: API base URL, defaulting to `http://localhost:5000/api`.

Backend (`Backend/.env`):

- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: signing secret for authentication tokens.
- `PORT`: API port, defaulting to `5000`.

Never commit real credentials or personal service data.