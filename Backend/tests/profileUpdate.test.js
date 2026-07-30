import { beforeEach, describe, expect, it, vi } from "vitest";

const findById = vi.fn();
const findOne = vi.fn();
const updateMany = vi.fn();

vi.mock("../models/User.js", () => ({ default: { findById, findOne } }));
vi.mock("../models/AuthSession.js", () => ({ default: { updateMany } }));
vi.mock("../services/authSessionService.js", () => ({
  clearSessionCookie: vi.fn(),
  createAuthSession: vi.fn(),
  publicSession: vi.fn(),
  revokeSession: vi.fn(),
}));
vi.mock("../services/googleIdentityService.js", () => ({
  consumeGoogleLoginNonce: vi.fn(),
  findOrCreateGoogleUser: vi.fn(),
  GoogleIdentityError: class GoogleIdentityError extends Error {},
  issueGoogleLoginConfig: vi.fn(),
  verifyGoogleCredential: vi.fn(),
}));

const { updateProfile } = await import("../controllers/authController.js");
const { profileUpdateSchema } = await import("../validation/schemas.js");

const response = () => {
  const res = {
    statusCode: 200,
    payload: null,
    status: vi.fn((code) => { res.statusCode = code; return res; }),
    json: vi.fn((payload) => { res.payload = payload; return res; }),
  };
  return res;
};

const buildUser = () => ({
  _id: "user-1",
  name: "Asha Rao",
  email: "asha@example.com",
  role: "citizen",
  createdAt: new Date("2026-01-02T00:00:00.000Z"),
  password: "stored-hash",
  matchPassword: vi.fn().mockResolvedValue(true),
  save: vi.fn().mockResolvedValue(undefined),
});

const request = (body) => ({
  body,
  user: { userId: "user-1", email: "asha@example.com", role: "citizen" },
  authSession: { _id: "session-1", csrfToken: "csrf-token" },
});

describe("profile updates", () => {
  let user;

  beforeEach(() => {
    vi.clearAllMocks();
    user = buildUser();
    findById.mockReturnValue({ select: vi.fn().mockResolvedValue(user) });
    findOne.mockResolvedValue(null);
    updateMany.mockResolvedValue({ modifiedCount: 1 });
  });

  it("updates a display name without requiring credential verification", async () => {
    const res = response();
    await updateProfile(request({ name: "Asha Devi" }), res);

    expect(res.statusCode).toBe(200);
    expect(user.name).toBe("Asha Devi");
    expect(user.save).toHaveBeenCalledOnce();
    expect(updateMany).not.toHaveBeenCalled();
    expect(res.payload.user).not.toHaveProperty("password");
  });

  it("verifies the current password and revokes other sessions for credential changes", async () => {
    const res = response();
    await updateProfile(request({
      currentPassword: "current-password",
      newPassword: "new-password-123",
      confirmPassword: "new-password-123",
    }), res);

    expect(user.matchPassword).toHaveBeenCalledWith("current-password");
    expect(user.password).toBe("new-password-123");
    expect(updateMany).toHaveBeenCalledOnce();
    expect(res.payload.csrfToken).toBe("csrf-token");
  });

  it("rejects credential updates without the current password or matching confirmation", () => {
    expect(profileUpdateSchema.safeParse({ email: "new@example.com" }).success).toBe(false);
    expect(profileUpdateSchema.safeParse({
      currentPassword: "current-password",
      newPassword: "new-password-123",
      confirmPassword: "different-password",
    }).success).toBe(false);
  });
});
