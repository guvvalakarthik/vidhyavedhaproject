import { describe, expect, it } from "vitest";
import ServiceDraft from "../models/ServiceDraft.js";
import { DRAFT_TEMPLATES } from "../data/draftTemplates.js";
import { deterministicDraft, generateServiceDraft } from "../services/draftGenerationService.js";
import { renderDraftPdf } from "../services/draftPdfService.js";
import { serviceDraftSchema } from "../validation/schemas.js";

const input = {
  serviceCode: "utilities",
  draftType: "complaint",
  readinessId: "",
  recipient: "Electricity grievance office",
  subject: "Repeated billing issue",
  facts: "My last two bills show the same meter reading despite regular usage.",
  chronology: "I contacted customer support on 10 July and 18 July.",
  requestedOutcome: "Please inspect the meter and issue a corrected bill if an error is confirmed.",
  referenceLabel: "Support ticket supplied by me",
  signerName: "Resident",
};

describe("service draft generation and PDF", () => {
  it("covers all nine service journeys and never claims submission", () => {
    expect(Object.keys(DRAFT_TEMPLATES)).toHaveLength(9);
    const content = deterministicDraft(input);
    expect(content.subject).toBe(input.subject);
    expect(content.paragraphs.join(" ")).toContain(input.facts);
    expect(content.paragraphs.join(" ")).not.toMatch(/submitted successfully|approved|eligible/i);
  });

  it("uses the reviewed template when no OpenAI key is configured", async () => {
    const previous = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const result = await generateServiceDraft({ input, userId: "user-1" });
    expect(result.mode).toBe("reviewed-template");
    expect(result.model).toBeNull();
    if (previous) process.env.OPENAI_API_KEY = previous;
  });

  it("requires a privacy acknowledgement but does not persist the flag", () => {
    const parsed = serviceDraftSchema.safeParse({ ...input, privacyAcknowledged: true });
    expect(parsed.success).toBe(true);
    expect(parsed.data.privacyAcknowledged).toBeUndefined();
    expect(serviceDraftSchema.safeParse(input).success).toBe(false);
  });
  it("renders a valid PDF with a draft boundary", async () => {
    const content = deterministicDraft(input);
    const pdf = await renderDraftPdf({
      draftId: "DRF-12AB34CD",
      serviceTitle: "Utility issue resolution",
      draftType: input.draftType,
      subject: input.subject,
      content,
      createdAt: new Date("2026-07-29T00:00:00Z"),
    });
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(500);
  });

  it("keeps every draft owner-scoped and excludes credential fields", () => {
    expect(ServiceDraft.schema.path("userId").options.required).toBe(true);
    for (const field of ["password", "otp", "aadhaarNumber", "bankAccount", "documentData"]) {
      expect(ServiceDraft.schema.path(field)).toBeUndefined();
    }
    expect(ServiceDraft.schema.path("mode").enumValues).toEqual(["reviewed-template", "openai"]);
  });
});
