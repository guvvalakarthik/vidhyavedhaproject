import mongoose from "mongoose";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import AuthSession from "../models/AuthSession.js";

const isProduction = process.env.NODE_ENV === "production";
export const SESSION_COOKIE_NAME = isProduction ? "__Host-vv_session" : "vv_session";
const idleMinutes = Number(process.env.SESSION_IDLE_MINUTES || 30);
const absoluteHours = Number(process.env.SESSION_ABSOLUTE_HOURS || 168);
const maxSessionsPerUser = Number(process.env.MAX_SESSIONS_PER_USER || 5);

const sessionSecret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must be set and contain at least 32 characters.");
  }
  return value;
};

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const randomToken = () => randomBytes(32).toString("base64url");

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
  maxAge,
});

const parseCookies = (header = "") =>
  Object.fromEntries(header.split(";").map((part) => {
    const separator = part.indexOf("=");
    if (separator < 0) return [part.trim(), ""];
    return [
      decodeURIComponent(part.slice(0, separator).trim()),
      decodeURIComponent(part.slice(separator + 1).trim()),
    ];
  }).filter(([key]) => key));

const requestIpHash = (req) => createHmac("sha256", sessionSecret())
  .update(req.ip || req.socket?.remoteAddress || "unknown")
  .digest("hex");

export const publicSession = (session, currentSessionId) => ({
  sessionId: session._id,
  current: String(session._id) === String(currentSessionId),
  userAgent: session.userAgent || "Unknown device",
  createdAt: session.createdAt,
  lastSeenAt: session.lastSeenAt,
  expiresAt: session.expiresAt,
});

export const createAuthSession = async ({ user, req, res }) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + absoluteHours * 60 * 60 * 1000);
  const idleExpiresAt = new Date(now.getTime() + idleMinutes * 60 * 1000);
  const rawToken = randomToken();
  const csrfToken = randomToken();

  const session = await AuthSession.create({
    tokenHash: sha256(rawToken),
    csrfToken,
    userId: user._id,
    userAgent: String(req.get("user-agent") || "").slice(0, 500),
    ipHash: requestIpHash(req),
    lastSeenAt: now,
    idleExpiresAt,
    expiresAt,
  });

  const overflow = await AuthSession.find({
    userId: user._id,
    revokedAt: null,
    _id: mongoose.trusted({ $ne: session._id }),
  }).sort({ lastSeenAt: -1 }).skip(Math.max(0, maxSessionsPerUser - 1)).select("_id");
  if (overflow.length) {
    await AuthSession.updateMany(
      { _id: mongoose.trusted({ $in: overflow.map(({ _id }) => _id) }) },
      { $set: { revokedAt: now } },
    );
  }

  res.cookie(
    SESSION_COOKIE_NAME,
    rawToken,
    cookieOptions(expiresAt.getTime() - now.getTime()),
  );
  return { session, csrfToken };
};

export const clearSessionCookie = (res) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });
};

export const optionalSession = async (req, res, next) => {
  try {
    const rawToken = parseCookies(req.headers.cookie)[SESSION_COOKIE_NAME];
    if (!rawToken) return next();

    const now = new Date();
    const session = await AuthSession.findOne({
      tokenHash: sha256(rawToken),
      revokedAt: null,
      expiresAt: mongoose.trusted({ $gt: now }),
      idleExpiresAt: mongoose.trusted({ $gt: now }),
    }).populate("userId");

    if (!session?.userId) {
      clearSessionCookie(res);
      return next();
    }

    req.authSession = session;
    req.user = {
      userId: session.userId._id,
      email: session.userId.email,
      role: session.userId.role || "citizen",
    };

    if (now.getTime() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
      session.lastSeenAt = now;
      session.idleExpiresAt = new Date(now.getTime() + idleMinutes * 60 * 1000);
      await session.save();
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireCsrf = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method) || !req.authSession) return next();
  const supplied = req.get("x-csrf-token") || "";
  const expected = req.authSession.csrfToken || "";
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  if (
    suppliedBuffer.length === expectedBuffer.length
    && suppliedBuffer.length > 0
    && timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return next();
  }
  return res.status(403).json({ error: "Your security token is missing or invalid. Refresh and try again." });
};

export const revokeSession = async (session) => {
  if (!session || session.revokedAt) return;
  session.revokedAt = new Date();
  await session.save();
};
