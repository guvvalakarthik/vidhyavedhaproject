# Consent-controlled encrypted document vault

Phase 7 stores preparation documents as AES-256-GCM ciphertext.

- Accepted types: PDF, JPEG, PNG.
- Maximum size: 5 MB; uploads stay in memory only until encrypted.
- The original filename is encrypted separately.
- MongoDB stores metadata, IVs, authentication tags, and an opaque storage name—not file bytes.
- Every read is owner-scoped and active-consent scoped.
- Revocation deletes the ciphertext and clears encrypted filename material.
- Responses use private, no-store caching.

Set `DOCUMENT_ENCRYPTION_KEY` to a base64-encoded 32-byte random value. The API returns `503` for vault operations if this dedicated key is absent or invalid; it never falls back to the session secret.

Encrypted blobs live under `Backend/storage/documents/`, which is excluded from Git. Production deployments should use a durable encrypted volume or object store and manage the encryption key through a secrets manager.
