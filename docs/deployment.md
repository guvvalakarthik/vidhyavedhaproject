# Deployment guide

## Recommended topology

Deploy the Vite output to a static HTTPS host and the Express API to a Node 22 service
on the same registrable domain when possible (for example `app.example.in` and
`api.example.in`). Use managed MongoDB with private networking. The current encrypted
vault requires a persistent volume attached to one API instance; do not scale the API
horizontally with vault uploads enabled until shared encrypted object storage and KMS
are implemented.

## Required secrets and configuration

Store values in the platform secret manager, never in image layers, repository files,
or CI logs.

- `MONGO_URI`
- `SESSION_SECRET` (new random value, at least 32 characters; no JWT fallback)
- `CLIENT_ORIGINS` (exact HTTPS frontend origins)
- `GOOGLE_CLIENT_ID` when Google sign-in is enabled
- `OPENAI_API_KEY` only when optional generation is enabled
- `DOCUMENT_ENCRYPTION_KEY` only with an approved vault key/backup procedure
- `ANALYTICS_HASH_KEY` independent from the session secret
- session lifetime, retention and port settings from `Backend/.env.example`

Frontend builds use `VITE_API_URL`. Treat every `VITE_*` value as public.

## Release procedure

1. Require green CI: frontend tests, backend tests, production build and dependency policy.
2. Review Dependabot/secret-scanning alerts and the integration register.
3. Build immutable frontend/API artifacts from the reviewed commit and record its SHA.
4. Back up MongoDB and verify the last restore drill before schema-affecting releases.
5. Deploy API configuration/secrets, then the API, then the frontend.
6. Verify the API root response, registration/login/logout, CSRF rejection, Google
   sign-in configuration state, one primary resident workflow, provider authorization,
   and logs without sensitive values.
7. Run a synthetic booking/status action against demo data and clean it up.
8. Monitor error rate, latency, authentication failures, rate-limit events, database
   connections, worker errors, storage capacity and external-provider failures.

## Cookie, proxy and CORS requirements

- Terminate TLS at a trusted proxy and redirect HTTP to HTTPS.
- Preserve the original client IP only through a trusted proxy configuration.
- Keep `CLIENT_ORIGINS` exact; never use `*` with credentialed requests.
- Production cookies use the `__Host-` prefix and therefore require HTTPS, path `/`,
  and no Domain attribute.
- Prefer same-site frontend/API deployment. If cross-site deployment is introduced,
  redesign and retest cookie SameSite and CSRF assumptions before release.
- Register only exact production origins in Google Cloud Console.

## Data operations

- Configure automated encrypted MongoDB backups and quarterly restore drills.
- Back up encrypted document bytes and metadata together; protect the encryption key
  separately. A ciphertext backup without the correct key version is unrecoverable.
- Run session/record retention jobs and monitor TTL indexes.
- Revoke all active sessions after a suspected session-secret disclosure.

## Rollback

Keep the prior immutable artifacts and configuration version. For application-only
failures, restore the prior API/frontend artifact. Do not roll back a database schema
or encryption key blindly: use a documented forward-compatible migration or restore
a verified backup. After rollback, rerun authentication and the three portfolio smoke
flows, then document the incident and corrective action.

## Current production blockers

Before handling real sensitive documents or partner operations, add managed KMS and
object storage, malware scanning, shared rate limiting, a dedicated job queue/leader,
readiness checks, centralized redacted logging/alerts, backup-restore evidence,
provider agreements, and reviewed privacy/retention terms.
