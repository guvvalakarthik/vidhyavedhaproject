import { randomBytes, timingSafeEqual } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const isProduction = process.env.NODE_ENV === "production";
const GOOGLE_NONCE_COOKIE = isProduction ? "__Host-vv_google_nonce" : "vv_google_nonce";
const GOOGLE_NONCE_MAX_AGE_MS = 10 * 60 * 1000;

const configuredClientId = () => String(process.env.GOOGLE_CLIENT_ID || "").trim();

const nonceCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
  ...(maxAge ? { maxAge } : {}),
});

const readCookie = (header = "", name) => {
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return "";
    }
  }
  return "";
};

const secureEqual = (left = "", right = "") => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length > 0
    && leftBuffer.length === rightBuffer.length
    && timingSafeEqual(leftBuffer, rightBuffer);
};

const selected = (query) => query.select("+googleSub");

export class GoogleIdentityError extends Error {
  constructor(message, { status = 401, code = "GOOGLE_SIGN_IN_FAILED" } = {}) {
    super(message);
    this.name = "GoogleIdentityError";
    this.status = status;
    this.code = code;
  }
}

export const issueGoogleLoginConfig = (res) => {
  const clientId = configuredClientId();
  if (!clientId) return { enabled: false };

  const nonce = randomBytes(32).toString("base64url");
  res.cookie(GOOGLE_NONCE_COOKIE, nonce, nonceCookieOptions(GOOGLE_NONCE_MAX_AGE_MS));
  return { enabled: true, clientId, nonce };
};

export const consumeGoogleLoginNonce = (req, res) => {
  const nonce = readCookie(req.headers.cookie, GOOGLE_NONCE_COOKIE);
  res.clearCookie(GOOGLE_NONCE_COOKIE, nonceCookieOptions());
  return nonce;
};

export const verifyGoogleCredential = async ({
  credential,
  expectedNonce,
  clientId = configuredClientId(),
  verifier,
}) => {
  if (!clientId) {
    throw new GoogleIdentityError("Google sign-in is not configured.", {
      status: 503,
      code: "GOOGLE_SIGN_IN_NOT_CONFIGURED",
    });
  }
  if (!credential || !expectedNonce) {
    throw new GoogleIdentityError("This Google sign-in attempt expired. Please try again.", {
      code: "GOOGLE_SIGN_IN_EXPIRED",
    });
  }

  try {
    const client = verifier || new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();

    if (
      !payload?.sub
      || !payload.email
      || payload.email_verified !== true
      || !secureEqual(payload.nonce, expectedNonce)
    ) {
      throw new GoogleIdentityError("Google could not verify this sign-in attempt.");
    }

    return {
      sub: String(payload.sub),
      email: String(payload.email).trim().toLowerCase(),
      name: String(payload.name || payload.email.split("@")[0] || "Vidhya Vedha user")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 120),
      hostedDomain: payload.hd ? String(payload.hd).toLowerCase() : null,
    };
  } catch (error) {
    if (error instanceof GoogleIdentityError) throw error;
    throw new GoogleIdentityError("Google could not verify this sign-in attempt.");
  }
};

const isAuthoritativeGoogleEmail = ({ email, hostedDomain }) =>
  email.endsWith("@gmail.com") || Boolean(hostedDomain);

export const findOrCreateGoogleUser = async (profile, { UserModel = User } = {}) => {
  let user = await selected(UserModel.findOne({ googleSub: profile.sub }));
  if (user) return { user, created: false, linked: false };

  user = await selected(UserModel.findOne({ email: profile.email }));
  if (user) {
    if (user.googleSub && user.googleSub !== profile.sub) {
      throw new GoogleIdentityError("This email is already linked to another Google account.", {
        status: 409,
        code: "GOOGLE_ACCOUNT_CONFLICT",
      });
    }
    if (!isAuthoritativeGoogleEmail(profile)) {
      throw new GoogleIdentityError(
        "This email already uses password sign-in. Sign in with your password instead.",
        { status: 409, code: "PASSWORD_SIGN_IN_REQUIRED" },
      );
    }

    user.googleSub = profile.sub;
    await user.save();
    return { user, created: false, linked: true };
  }

  user = await UserModel.create({
    name: profile.name,
    email: profile.email,
    googleSub: profile.sub,
    role: "citizen",
  });
  return { user, created: true, linked: false };
};
