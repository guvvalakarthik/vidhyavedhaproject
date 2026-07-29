import { GOVERNMENT_SERVICE_CATALOG } from "../data/governmentServices.js";
import { EDUCATION_PATHWAYS } from "../data/educationPathways.js";
import { FINANCIAL_PATHWAYS } from "../data/financialPathways.js";
import { FARMING_PATHWAYS } from "../data/farmingPathways.js";
import { EMERGENCY_SERVICES } from "../data/emergencyServices.js";
import { DEFAULT_HEALTHCARE_PROVIDERS } from "../data/healthcareProviders.js";

const stopWords = new Set([
  "a", "an", "and", "are", "for", "from", "how", "i", "in", "is", "me", "my",
  "of", "on", "or", "the", "to", "what", "where", "with", "you",
]);

const tokenize = (value) => [...new Set(
  String(value || "").toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter(
    (token) => token.length > 1 && !stopWords.has(token),
  ) || [],
)];

const searchableText = (value) => {
  if (Array.isArray(value)) return value.map(searchableText).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(searchableText).join(" ");
  return String(value || "");
};

const sourceFrom = ({ service, code, title, authority, officialUrl, summary, boundary, details }) => ({
  sourceId: `${service}:${code}`,
  service,
  code,
  title,
  authority: authority || "Vidhya Vedha service catalogue",
  officialUrl: officialUrl || "",
  summary: summary || "",
  boundary: boundary || "",
  content: searchableText(details),
});

export const KNOWLEDGE_SOURCES = [
  ...GOVERNMENT_SERVICE_CATALOG.map((item) => sourceFrom({
    service: "government",
    code: item.serviceCode,
    title: item.name,
    authority: item.authority,
    officialUrl: item.officialUrl,
    summary: item.summary,
    boundary: "The responsible government authority decides eligibility, accepts applications, and owns status information.",
    details: [item.category, item.access, item.timeNote, item.feeNote, item.requirements, item.steps, item.searchTags],
  })),
  ...EDUCATION_PATHWAYS.map((item) => sourceFrom({
    service: "education",
    code: item.pathwayCode,
    title: item.title,
    authority: item.authority,
    officialUrl: item.officialUrl,
    summary: item.summary,
    boundary: item.boundary,
    details: [item.category, item.learnerStages, item.goalCodes, item.requirements, item.tasks],
  })),
  ...FINANCIAL_PATHWAYS.map((item) => sourceFrom({
    service: "finance",
    code: item.pathwayCode,
    title: item.title,
    authority: item.authority,
    officialUrl: item.officialUrl,
    summary: item.summary,
    boundary: item.boundary,
    details: [item.category, item.needCodes, item.preparationItems, item.watchFor, item.tasks],
  })),
  ...FARMING_PATHWAYS.map((item) => sourceFrom({
    service: "farming",
    code: item.pathwayCode,
    title: item.title,
    authority: item.authority,
    officialUrl: item.officialUrl,
    summary: item.summary,
    boundary: item.boundary,
    details: [item.category, item.goalCodes, item.seasons, item.tasks],
  })),
  ...EMERGENCY_SERVICES.map((item) => sourceFrom({
    service: "emergency",
    code: item.code,
    title: item.name,
    summary: item.summary,
    boundary: "Use emergency services when anyone is in immediate danger; this catalogue does not determine dispatch priority.",
    details: item,
  })),
  ...DEFAULT_HEALTHCARE_PROVIDERS.map((item) => sourceFrom({
    service: "healthcare",
    code: item.providerCode,
    title: `${item.name} - ${item.specialty}`,
    authority: item.location.name,
    summary: `${item.qualifications}; ${item.experienceYears} years of experience.`,
    boundary: "Provider information supports appointment discovery and is not medical diagnosis or treatment advice.",
    details: [item.specialty, item.languages, item.modes, item.location],
  })),
];

const scoreSource = (source, queryTokens) => {
  const titleTokens = new Set(tokenize(source.title));
  const summaryTokens = new Set(tokenize(source.summary));
  const allTokens = new Set(tokenize(`${source.title} ${source.summary} ${source.content}`));
  return queryTokens.reduce((score, token) => {
    if (titleTokens.has(token)) return score + 6;
    if (summaryTokens.has(token)) return score + 3;
    if (allTokens.has(token)) return score + 1;
    return score;
  }, 0);
};

export const searchKnowledge = ({ query, service = "all", limit = 5 }) => {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];
  return KNOWLEDGE_SOURCES
    .filter((source) => service === "all" || source.service === service)
    .map((source) => ({ source, score: scoreSource(source, queryTokens) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.source.title.localeCompare(right.source.title))
    .slice(0, limit)
    .map(({ source }) => ({
      sourceId: source.sourceId,
      service: source.service,
      title: source.title,
      authority: source.authority,
      officialUrl: source.officialUrl,
      summary: source.summary,
      boundary: source.boundary,
      excerpt: source.content.slice(0, 1200),
    }));
};
