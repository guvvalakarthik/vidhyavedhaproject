import { afterEach, describe, expect, it } from "vitest";
import { answerWithGrounding } from "../services/aiAssistantService.js";
import { searchKnowledge } from "../services/knowledgeService.js";

const originalApiKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalApiKey;
});

describe("grounded citizen-service assistant", () => {
  it("ranks matching official guidance ahead of unrelated services", () => {
    const [first] = searchKnowledge({ query: "renew my passport appointment", service: "government" });
    expect(first.sourceId).toBe("government:passport");
    expect(first.authority).toMatch(/Passport Seva/i);
    expect(first.officialUrl).toMatch(/^https:\/\//);
  });

  it("keeps service filters from leaking unrelated catalogue entries", () => {
    const results = searchKnowledge({ query: "scholarship", service: "finance" });
    expect(results.every(({ service }) => service === "finance")).toBe(true);
  });

  it("returns a cited deterministic answer when no API key is configured", async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await answerWithGrounding({
      question: "How do I open a basic bank account?",
      service: "finance",
      language: "English",
      userId: "507f1f77bcf86cd799439011",
    });
    expect(result.mode).toBe("grounded-fallback");
    expect(result.answer).toMatch(/official links/i);
    expect(result.citations[0].sourceId).toBe("finance:basic-bank-account");
  });
});
