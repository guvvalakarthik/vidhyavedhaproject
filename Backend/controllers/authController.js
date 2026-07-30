import mongoose from "mongoose";
import User from "../models/User.js";
import AuthSession from "../models/AuthSession.js";
import {
  clearSessionCookie,
  createAuthSession,
  publicSession,
  revokeSession,
} from "../services/authSessionService.js";
import {
  consumeGoogleLoginNonce,
  findOrCreateGoogleUser,
  GoogleIdentityError,
  issueGoogleLoginConfig,
  verifyGoogleCredential,
} from "../services/googleIdentityService.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || "citizen",
});

const sessionResponse = async ({ user, req, res, status = 200, message }) => {
  if (req.authSession) await revokeSession(req.authSession);
  const { csrfToken } = await createAuthSession({ user, req, res });
  return res.status(status).json({ message, user: publicUser(user), csrfToken });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.exists({ email })) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const user = await User.create({ name, email, password, role: "citizen" });
    return sessionResponse({ user, req, res, status: 201, message: "Registration successful" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    return await sessionResponse({ user, req, res, message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getGoogleLoginConfig = (_req, res) => {
  return res.json(issueGoogleLoginConfig(res));
};

export const googleLogin = async (req, res) => {
  const expectedNonce = consumeGoogleLoginNonce(req, res);
  try {
    const profile = await verifyGoogleCredential({
      credential: req.body.credential,
      expectedNonce,
    });
    const { user, created, linked } = await findOrCreateGoogleUser(profile);
    const message = created
      ? "Google account created and signed in."
      : linked
        ? "Google sign-in linked to your account."
        : "Google sign-in successful.";
    return await sessionResponse({
      user,
      req,
      res,
      status: created ? 201 : 200,
      message,
    });
  } catch (error) {
    if (error instanceof GoogleIdentityError) {
      return res.status(error.status).json({ error: error.message, code: error.code });
    }
    if (error?.code === 11000) {
      return res.status(409).json({
        error: "This Google account is already linked. Please try signing in again.",
        code: "GOOGLE_ACCOUNT_CONFLICT",
      });
    }
    console.error("Google login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  return res.json({ user: publicUser(user), csrfToken: req.authSession.csrfToken });
};

export const logout = async (req, res) => {
  await revokeSession(req.authSession);
  clearSessionCookie(res);
  return res.json({ message: "Signed out successfully." });
};

export const listSessions = async (req, res) => {
  const sessions = await AuthSession.find({
    userId: req.user.userId,
    revokedAt: null,
    expiresAt: mongoose.trusted({ $gt: new Date() }),
  }).sort({ lastSeenAt: -1 });
  return res.json({
    sessions: sessions.map((session) => publicSession(session, req.authSession._id)),
  });
};

export const revokeSessionById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.sessionId)) {
    return res.status(400).json({ error: "Invalid session identifier." });
  }
  const session = await AuthSession.findOne({
    _id: req.params.sessionId,
    userId: req.user.userId,
    revokedAt: null,
  });
  if (!session) return res.status(404).json({ error: "Session not found." });
  await revokeSession(session);
  const isCurrent = String(session._id) === String(req.authSession._id);
  if (isCurrent) clearSessionCookie(res);
  return res.json({ message: "Session revoked.", currentSessionRevoked: isCurrent });
};

export const revokeOtherSessions = async (req, res) => {
  await AuthSession.updateMany({
    userId: req.user.userId,
    _id: mongoose.trusted({ $ne: req.authSession._id }),
    revokedAt: null,
  }, { $set: { revokedAt: new Date() } });
  return res.json({ message: "Other sessions signed out." });
};
