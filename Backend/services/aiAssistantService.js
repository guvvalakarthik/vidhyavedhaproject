import { createHash } from "node:crypto";
import OpenAI from "openai";
import { searchKnowledge } from "./knowledgeService.js";

const model = process.env.OPENAI_MODEL || "gpt-5.6-sol";

const safetyIdentifier = (userId) => createHash("sha256")
  .update(`vidhya-vedha:${userId}`)
  .digest("hex");

const fallbackAnswer = (question, sources) => {
  if (!sources.length) {
    return "I could not find a matching verified service in the current Vidhya Vedha catalogue. Try naming the government service, education goal, financial need, healthcare specialty, or roadside problem. For urgent danger, contact the appropriate local emergency service.";
  }
  const guidance = sources.slice(0, 3).map((source, index) =>
    `${index + 1}. ${source.title}: ${source.summary}${source.boundary ? ` Important: ${source.boundary}` : ""}`,
  ).join("\n\n");
  return `Here is the closest verified guidance for ?${question}?:\n\n${guidance}\n\nUse the official links below to confirm current requirements before submitting documents or making a payment.`;
};

const systemInstructions = `You are the Vidhya Vedha citizen-services guide for India.
Answer only from the trusted context supplied with the request. Cite sources inline as [1], [2], and so on.
If context is insufficient, say so plainly. Never invent eligibility, fees, deadlines, availability, or application status.
Do not diagnose illness, decide emergency priority, approve credit, provide legal conclusions, or claim to submit an official application.
Never ask for Aadhaar numbers, passwords, OTPs, banking credentials, complete medical records, or identity-document uploads.
Reply in the requested language using clear, respectful language. Include the responsible authority, practical next steps, an important boundary, and the official handoff when available.`;

export const answerWithGrounding = async ({ question, service = "all", language = "English", userId }) => {
  const sources = searchKnowledge({ query: question, service, limit: 5 });
  const citations = sources.map(({ sourceId, title, authority, officialUrl, service: sourceService }) => ({
    sourceId,
    title,
    authority,
    officialUrl,
    service: sourceService,
  }));

  if (!process.env.OPENAI_API_KEY) {
    return { answer: fallbackAnswer(question, sources), citations, mode: "grounded-fallback", model: null };
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model,
      reasoning: { effort: "low" },
      text: { verbosity: "medium" },
      safety_identifier: safetyIdentifier(userId),
      instructions: systemInstructions,
      input: `Requested language: ${language}\nUser question: ${question}\n\nTrusted context:\n${JSON.stringify(sources)}`,
    });
    const answer = response.output_text?.trim();
    if (!answer) throw new Error("The model returned no text.");
    return { answer, citations, mode: "openai", model };
  } catch (error) {
    console.error("AI assistant fallback:", error?.message || error);
    return { answer: fallbackAnswer(question, sources), citations, mode: "grounded-fallback", model: null };
  }
};
