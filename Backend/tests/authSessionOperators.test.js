import mongoose from "mongoose";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import AuthSession from "../models/AuthSession.js";
import { createAuthSession } from "../services/authSessionService.js";

describe("authentication session operator filters", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = "test-session-secret-at-least-32-characters";
  });
  afterEach(() => vi.restoreAllMocks());

  it("keeps the session-overflow exclusion trusted under global filter sanitization", async () => {
    const sessionId = new mongoose.Types.ObjectId();
    let capturedFilter;
    vi.spyOn(AuthSession, "create").mockResolvedValue({ _id: sessionId });
    vi.spyOn(AuthSession, "find").mockImplementation((filter) => {
      capturedFilter = filter;
      return {
        sort: () => ({
          skip: () => ({
            select: () => Promise.resolve([]),
          }),
        }),
      };
    });

    const req = {
      ip: "127.0.0.1",
      socket: {},
      get: () => "test-agent",
    };
    const res = { cookie: vi.fn() };
    await createAuthSession({
      user: { _id: new mongoose.Types.ObjectId() },
      req,
      res,
    });

    mongoose.sanitizeFilter(capturedFilter);
    expect(capturedFilter._id.$ne).toEqual(sessionId);
    expect(res.cookie).toHaveBeenCalledOnce();
  });
});
