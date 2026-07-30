import { afterEach, describe, expect, it, vi } from "vitest";
import User from "../models/User.js";
import {
  findOrCreateGoogleUser,
  GoogleIdentityError,
  issueGoogleLoginConfig,
  verifyGoogleCredential,
} from "../services/googleIdentityService.js";

const queryResult = (value) => ({ select: vi.fn().mockResolvedValue(value) });

describe("Google identity verification", () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;

  afterEach(() => {
    if (originalClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = originalClientId;
    vi.restoreAllMocks();
  });

  it("verifies the Google audience and nonce before returning a normalized profile", async () => {
    const verifier = {
      verifyIdToken: vi.fn().mockResolvedValue({
        getPayload: () => ({
          sub: "google-user-123",
          email: " Resident@Gmail.com ",
          email_verified: true,
          name: "  Maya   Rao  ",
          nonce: "nonce-123",
        }),
      }),
    };

    const profile = await verifyGoogleCredential({
      credential: "signed-google-token",
      expectedNonce: "nonce-123",
      clientId: "web-client.apps.googleusercontent.com",
      verifier,
    });

    expect(verifier.verifyIdToken).toHaveBeenCalledWith({
      idToken: "signed-google-token",
      audience: "web-client.apps.googleusercontent.com",
    });
    expect(profile).toEqual({
      sub: "google-user-123",
      email: "resident@gmail.com",
      name: "Maya Rao",
      hostedDomain: null,
    });
  });

  it("rejects a token that is not bound to the login nonce", async () => {
    const verifier = {
      verifyIdToken: vi.fn().mockResolvedValue({
        getPayload: () => ({
          sub: "google-user-123",
          email: "resident@gmail.com",
          email_verified: true,
          nonce: "attacker-nonce",
        }),
      }),
    };

    await expect(verifyGoogleCredential({
      credential: "signed-google-token",
      expectedNonce: "expected-nonce",
      clientId: "web-client.apps.googleusercontent.com",
      verifier,
    })).rejects.toMatchObject({
      name: "GoogleIdentityError",
      code: "GOOGLE_SIGN_IN_FAILED",
      status: 401,
    });
  });

  it("returns a disabled public configuration when Google is not configured", () => {
    delete process.env.GOOGLE_CLIENT_ID;
    const res = { cookie: vi.fn() };

    expect(issueGoogleLoginConfig(res)).toEqual({ enabled: false });
    expect(res.cookie).not.toHaveBeenCalled();
  });
});

describe("Google account resolution", () => {
  it("creates a citizen account keyed by the stable Google subject", async () => {
    const createdUser = { _id: "user-1", email: "resident@gmail.com", role: "citizen" };
    const UserModel = {
      findOne: vi.fn()
        .mockReturnValueOnce(queryResult(null))
        .mockReturnValueOnce(queryResult(null)),
      create: vi.fn().mockResolvedValue(createdUser),
    };

    const result = await findOrCreateGoogleUser({
      sub: "google-user-123",
      email: "resident@gmail.com",
      name: "Resident",
      hostedDomain: null,
    }, { UserModel });

    expect(UserModel.create).toHaveBeenCalledWith({
      name: "Resident",
      email: "resident@gmail.com",
      googleSub: "google-user-123",
      role: "citizen",
    });
    expect(result).toEqual({ user: createdUser, created: true, linked: false });
  });

  it("links an existing Gmail account after Google verifies the authoritative email", async () => {
    const existingUser = {
      email: "resident@gmail.com",
      save: vi.fn().mockResolvedValue(undefined),
    };
    const UserModel = {
      findOne: vi.fn()
        .mockReturnValueOnce(queryResult(null))
        .mockReturnValueOnce(queryResult(existingUser)),
    };

    const result = await findOrCreateGoogleUser({
      sub: "google-user-123",
      email: "resident@gmail.com",
      name: "Resident",
      hostedDomain: null,
    }, { UserModel });

    expect(existingUser.googleSub).toBe("google-user-123");
    expect(existingUser.save).toHaveBeenCalledOnce();
    expect(result.linked).toBe(true);
  });

  it("does not silently link an existing non-Google-authoritative email", async () => {
    const existingUser = { email: "resident@example.org", save: vi.fn() };
    const UserModel = {
      findOne: vi.fn()
        .mockReturnValueOnce(queryResult(null))
        .mockReturnValueOnce(queryResult(existingUser)),
    };

    await expect(findOrCreateGoogleUser({
      sub: "google-user-123",
      email: "resident@example.org",
      name: "Resident",
      hostedDomain: null,
    }, { UserModel })).rejects.toEqual(expect.objectContaining({
      constructor: GoogleIdentityError,
      code: "PASSWORD_SIGN_IN_REQUIRED",
      status: 409,
    }));
    expect(existingUser.save).not.toHaveBeenCalled();
  });

  it("allows Google-only users while retaining password requirements for local accounts", async () => {
    await expect(new User({
      name: "Google Resident",
      email: "google@gmail.com",
      googleSub: "google-user-123",
    }).validate()).resolves.toBeUndefined();

    await expect(new User({
      name: "Local Resident",
      email: "local@example.com",
    }).validate()).rejects.toMatchObject({
      errors: expect.objectContaining({ password: expect.anything() }),
    });
  });
});
