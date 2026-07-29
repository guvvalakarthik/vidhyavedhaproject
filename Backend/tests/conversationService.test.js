import { describe, expect, it } from "vitest";
import { conversationExpiry, conversationTitleFrom, retentionDays } from "../services/conversationService.js";

describe("AI conversation lifecycle", () => {
  it("creates concise deterministic titles from the first message", () => {
    expect(conversationTitleFrom("  Help   me renew my passport  ")).toBe("Help me renew my passport");
    expect(conversationTitleFrom("x".repeat(100))).toHaveLength(64);
  });

  it("sets a bounded retention expiry", () => {
    const now = new Date("2026-07-29T00:00:00.000Z");
    expect(conversationExpiry(now).getTime() - now.getTime()).toBe(retentionDays * 24 * 60 * 60 * 1000);
    expect(retentionDays).toBeGreaterThanOrEqual(1);
    expect(retentionDays).toBeLessThanOrEqual(365);
  });
});
