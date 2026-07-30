# Threat model

## Scope and assets

This model covers the React client, Express API, MongoDB, encrypted document storage,
Google sign-in, optional OpenAI calls, provider/admin operations, and official-link
handoffs. Primary assets are account/session integrity, personal service records,
document plaintext and encryption keys, provider queues, consent/audit evidence,
API credentials, and the accuracy of integration claims.

## Actors

- Resident using their own records
- Provider or administrator with elevated operational access
- Anonymous or authenticated attacker
- Malicious user attempting cross-tenant access or resource exhaustion
- Compromised dependency or deployment credential
- Untrusted prompt/source content attempting to influence an AI result

## Threats and controls

| Threat | Existing control | Residual risk / required operation |
| --- | --- | --- |
| Credential disclosure | `.env` ignored, GitHub secret scanning/push protection, rotation runbook | Historical Git purge and provider-side rotation must be completed |
| Session theft/fixation | Random opaque token, hash at rest, HTTP-only secure production cookie, idle/absolute expiry, device limit, revocation | TLS and correct proxy/cookie configuration are deployment requirements |
| CSRF | Per-session CSRF token on authenticated mutations, SameSite cookie, exact CORS allowlist | XSS could read the CSRF token; maintain CSP and dependency hygiene |
| Broken object authorization | Owner filters, role middleware, trusted Mongo operators, authorization tests | Every new query needs a negative cross-tenant test |
| Injection/mass assignment | Zod validation, payload sanitization, explicit persisted fields, Mongoose | Review new nested/filter inputs and never accept raw Mongo operators |
| Brute force/abuse | Auth, AI and general rate limits; password hashing | Use a shared rate-limit store and alerting in multi-instance production |
| Stored/reflected XSS | React escaping, Helmet, constrained inputs, no HTML rendering | Official links and future rich text require protocol and encoding review |
| Malicious upload | MIME allowlist, one file, 5 MB limit, encryption and owner checks | No malware/content scan yet; vault remains prototype-only |
| Vault key compromise | AES-256-GCM, key outside database, consent/revocation | Use managed KMS, versioned envelope keys, backup and tested rotation before production |
| Prompt injection/hallucination | Reviewed local knowledge, structured output, citations, candidate allowlist, deterministic fallback | Generated content is guidance; residents preview drafts and no automatic submission occurs |
| Agent overreach | Bounded action catalogue, explicit confirmation, owner checks, idempotent domain operations | Do not add money movement, identity submission or irreversible authority actions |
| Provider data leakage | RBAC and redacted operational projections | Audit privileged reads and implement least-privilege role administration |
| False integration claim | Capability-aware status and integration register | Product/release review must block unverified "live" wording |
| Availability/data loss | Body/file limits, database indexes, lockfiles | Add backups, restore drills, health/readiness checks, queues and monitoring |

## Privacy principles

Collect the minimum data needed for a task, keep records owner-scoped, avoid identity,
payment, OTP and evidence collection when the official provider should own it, expire
raw blocker signals, suppress small analytics groups, and require affirmative consent
for documents, reminders and human contact.

## Security review triggers

Repeat threat modeling before adding an external authority API, payments, clinical
records, government identity data, background agent actions, a new file type, shared
object storage, multi-tenant provider organizations, or a new privileged role.
