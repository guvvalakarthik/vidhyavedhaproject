# Integration and data status

This register is the source of truth for claims about external systems. Product
screens must not use words such as "live", "verified", or "connected" unless the
corresponding row is updated with evidence, an owner, and a review date.

| Capability | Current mode | What is real | What is fixture or not connected |
| --- | --- | --- | --- |
| Email/password authentication | Internal production-style | MongoDB user records, password hashing, opaque sessions, CSRF and RBAC | No external identity provider |
| Google sign-in | Configurable external integration | Google Identity Services token verification when `GOOGLE_CLIENT_ID` is configured | Disabled without administrator configuration |
| AI assistant and recommendations | Hybrid | OpenAI Responses API when a valid key is configured; schema and source boundaries remain local | Reviewed deterministic catalogue fallback when no key is present |
| Government, education, farming, finance, utility and commerce journeys | Official-route guidance | Reviewed links and internal owner-scoped preparation records | No submission to authorities and no external status API |
| Healthcare scheduling | Internal demonstration | Booking, uniqueness, ownership, lifecycle and provider queue run in Vidhya Vedha | Seeded providers/slots; no hospital, payment or health-record integration |
| Home maintenance | Internal demonstration | Booking lifecycle and ownership operate in the application | Seeded providers; no contracted marketplace or payment integration |
| Roadside dispatch | Internal demonstration | Request lifecycle, role-separated assignment and tracking operate internally | Demonstration dispatch network; no 112 or commercial recovery-provider connection |
| Status tracking | Capability-aware | Internal Vidhya records use working connectors | External authorities remain "not connected" until an adapter is registered |
| Assisted handoff | Reviewed-directory prototype | Consent, assignment and owner/provider workflow are implemented | Bundled centres are not a guarantee of live staffing or a commercial SLA |
| Document vault | Local encrypted prototype | AES-256-GCM encryption, consent, owner access and deletion are implemented | Local filesystem storage; no managed KMS, malware scan or cloud object store |
| Provider dashboard | Internal operations | Redacted queues and role checks use application records | Metrics reflect fixture/internal operations, not partner systems |
| Blocker analytics | Internal operations | Structured taxonomy, keyed pseudonyms, TTL and small-group suppression | No third-party analytics warehouse |

## Promotion rule

An integration can move from demonstration/guidance to connected only after all of
the following exist: a provider agreement, reviewed API documentation, scoped
credentials in a secret manager, sandbox and failure-mode tests, consent and data
retention review, monitoring, an operational owner, and product copy that names the
source and last verification date.
