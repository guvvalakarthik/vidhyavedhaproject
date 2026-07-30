# Google sign-in

Vidhya Vedha uses Google Identity Services for account authentication and then issues the same server-side Vidhya Vedha session used by email/password login. Google tokens are never used as application sessions and are not stored.

## Google Cloud setup

1. Open the [Google Auth Platform](https://console.cloud.google.com/auth/overview) for the deployment's Google Cloud project.
2. Configure the application name, support contact, audience, and consent-screen details.
3. Create an OAuth client with application type **Web application**.
4. Add every frontend origin under **Authorized JavaScript origins**. During local development this normally includes:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - `http://localhost:3002`
   - `http://127.0.0.1:3002`
5. Add the deployed HTTPS frontend origin before production release.
6. Copy the web client ID into `Backend/.env`:

   ```env
   GOOGLE_CLIENT_ID=123456789-example.apps.googleusercontent.com
   ```

7. Restart the API. The login page retrieves the public client ID from `GET /api/auth/google/config`; no frontend secret or rebuild is required.

A client secret is not required for this Google ID-token flow. Never commit downloaded OAuth credential files.

## Security flow

1. The browser requests a short-lived nonce from `GET /api/auth/google/config`.
2. The nonce is stored in an HTTP-only, SameSite cookie and included in Google's ID token.
3. The frontend sends the returned ID token to `POST /api/auth/google`.
4. The API uses Google's official Node authentication library to verify the signature, issuer, expiry, audience, verified email, and nonce.
5. The stable Google `sub` claim is linked to the local account.
6. Vidhya Vedha creates its normal HTTP-only session and returns a CSRF token.

Existing Gmail and Google Workspace accounts can be safely linked when Google is authoritative for the verified email. Existing accounts using a third-party email must continue with password sign-in instead of being silently linked.

If `GOOGLE_CLIENT_ID` is absent, the Google control shows an administrator-setup message and password login remains available.
