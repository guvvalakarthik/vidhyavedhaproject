# Privacy-safe blocker analytics

Phase 9 records resident-reported friction using a fixed taxonomy only.

- No free text, user ID, document, reference number, contact data, or service payload is accepted.
- A keyed HMAC pseudonym deduplicates the same service/stage/reason report from one resident per day.
- Raw events expire after 180 days.
- Admin reports show only groups with at least three signals.
- The dashboard clearly reports when groups are suppressed below the threshold.

Configure `ANALYTICS_HASH_KEY` as a dedicated secret. The session secret is used only as a compatibility fallback. Production environments should always provide the dedicated key and rotate it according to the analytics retention policy.
