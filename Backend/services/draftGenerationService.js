import { createHash } from "node:crypto";
import OpenAI from "openai";
import { draftTemplate } from "../data/draftTemplates.js";

const model = process.env.OPENAI_MODEL || "gpt-5.6-sol";
const clean = (value) => String(value || "").trim();
const safetyIdentifier = (userId) => createHash("sha256").update(`vidhya-draft:${userId}`).digest("hex");

const generatedSchema = {
  type: "object",
  properties: {
    subject: { type: "string", maxLength: 180 },
    salutation: { type: "string", maxLength: 220 },
    paragraphs: { type: "array", minItems: 2, maxItems: 6, items: { type: "string", maxLength: 1800 } },
    closing: { type: "string", maxLength: 220 },
  },
  required: ["subject", "salutation", "paragraphs", "closing"],
  additionalProperties: false,
};

export const deterministicDraft = (input) => {
  const template = draftTemplate(input.serviceCode, input.draftType);
  const chronology = clean(input.chronology);
  const reference = clean(input.referenceLabel);
  return {
    subject: clean(input.subject),
    salutation: `To ${clean(input.recipient) || template.recipient},`,
    paragraphs: [
      template.opening,
      `Details: ${clean(input.facts)}`,
      ...(chronology ? [`Relevant chronology: ${chronology}`] : []),
      ...(reference ? [`Reference supplied by me: ${reference}`] : []),
      `Requested outcome: ${clean(input.requestedOutcome)}`,
      "Please verify the information and advise me of any official requirements or next steps.",
    ],
    closing: clean(input.signerName) ? `Sincerely,\n${clean(input.signerName)}` : "Sincerely,",
  };
};

const enhanceDraft = async (input, fallback, userId) => {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model,
      reasoning: { effort: "low" },
      safety_identifier: safetyIdentifier(userId),
      instructions: [
        "Rewrite only the supplied service draft in clear, respectful plain language.",
        "Do not invent facts, eligibility, law, policy, dates, deadlines, fees, reference numbers, decisions, status, or contact details.",
        "Do not claim submission. Preserve uncertainty and keep the requested outcome proportionate.",
        "Return structured data only.",
      ].join(" "),
      input: JSON.stringify({ input, reviewedFallback: fallback }),
      text: {
        format: {
          type: "json_schema",
          name: "service_draft",
          strict: true,
          schema: generatedSchema,
        },
      },
    });
    const parsed = JSON.parse(response.output_text);
    return { content: parsed, mode: "openai", model };
  } catch (error) {
    console.error("Draft generation fallback:", error?.message || error);
    return null;
  }
};

export const generateServiceDraft = async ({ input, userId }) => {
  const fallback = deterministicDraft(input);
  const generated = await enhanceDraft(input, fallback, userId);
  return generated || { content: fallback, mode: "reviewed-template", model: null };
};
