# Credential rotation runbook

Treat every value ever committed in `Backend/.env` as public. Removing the file
from the current branch does not revoke a credential or erase it from Git history.

## Immediate actions

1. Revoke or rotate each credential at its issuing provider.
2. Generate a new, independent `SESSION_SECRET` with at least 32 random bytes.
3. Store replacement values in the deployment platform's secret manager, never in Git.
4. Restart every API instance so the new values are loaded.
5. Revoke all persisted authentication sessions after changing `SESSION_SECRET`.
6. Verify login, logout, CSRF protection, Google sign-in, document vault access,
   analytics pseudonyms, and AI-provider calls.
7. Record the owner, provider, rotation time, and verification result without
   recording the secret value.

Generate a suitable session secret locally:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

## Credential inventory

| Variable | Rotation action | Verification |
| --- | --- | --- |
| `SESSION_SECRET` / legacy `JWT_SECRET` | Replace with a newly generated `SESSION_SECRET`; do not reuse the legacy value | Existing cookies no longer authenticate and a new login succeeds |
| `MONGO_URI` | Rotate the database user password if the URI ever contained credentials | API connects with the replacement database user |
| `GOOGLE_CLIENT_ID` | Review authorized origins/redirect URIs; rotate any paired client secret if one existed | Google sign-in succeeds only from approved origins |
| `OPENAI_API_KEY` | Revoke the old key and create a scoped replacement | AI endpoints succeed and provider usage logs show only the new key |
| `DOCUMENT_ENCRYPTION_KEY` | Follow the vault key migration procedure before retiring an old key | Existing documents decrypt and new documents use the new key |
| `ANALYTICS_HASH_KEY` | Replace independently from the session secret | New events use new pseudonyms and contain no direct user identifier |

## Session revocation

Changing `SESSION_SECRET` changes request-IP pseudonyms but session tokens are
stored as hashes in MongoDB. Revoke existing sessions explicitly:

```javascript
db.authsessions.updateMany(
  { revokedAt: null },
  { $set: { revokedAt: new Date() } }
)
```

Use a database account and environment approved for operational maintenance.
Take a backup first and record the number of affected sessions.

## Rotation record

Keep this record in the team's private operations system, not in the repository:

| Field | Value |
| --- | --- |
| Credential/provider | |
| Owner | |
| Rotated at (UTC) | |
| Old credential revoked | |
| Dependent services restarted | |
| Verification evidence | |
| Next rotation date | |
