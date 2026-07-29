# Authentication sessions

Vidhya Vedha uses opaque, server-side authentication sessions instead of storing bearer tokens in browser storage.

## Security model

- The browser receives only an `HttpOnly` session cookie.
- MongoDB stores a SHA-256 hash of the cookie token, the user relationship, expiry information, and a CSRF token.
- Mutating authenticated API requests require the CSRF token in `X-CSRF-Token`.
- Session identifiers rotate at login and registration.
- Sessions expire after 30 minutes of inactivity by default and have a seven-day absolute lifetime.
- MongoDB's TTL index removes expired records.
- Users can review devices, revoke one session, or sign out all other devices.
- Production cookies use the `__Host-` prefix and require HTTPS.

## Frontend behavior

Axios sends cookies with `withCredentials: true`. `AuthContext` restores the user with `GET /api/auth/me`, keeps the CSRF token only in memory, and clears legacy JWT values from `localStorage`.

## API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/auth/sessions`
- `DELETE /api/auth/sessions/others`
- `DELETE /api/auth/sessions/:sessionId`

## Deployment

Use a randomly generated `SESSION_SECRET` with at least 32 characters. Serve the frontend and API over HTTPS. When they are on different origins, list the exact frontend origin in `CLIENT_ORIGINS`; wildcard origins cannot be used with credentialed requests.
