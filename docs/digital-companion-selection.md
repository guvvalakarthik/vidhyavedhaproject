# AI-guided service selection

The Digital Companion starts from the resident's goal and situation instead of requiring them to know a department or service name. It ranks only the nine reviewed Vidhya Vedha journeys and never decides legal, scheme, financial, medical or institutional eligibility.

## Intake boundary

The assessment stores a goal, topic, life stage, urgency, language, optional district label and optional short description. It deliberately has no Aadhaar, account, application, medical-record, OTP, password or document fields.

## Recommendation modes

- `reviewed-rules`: deterministic ranking by topic, goal, life stage and description keywords. This is always available and is the default when no OpenAI key exists.
- `openai`: the Responses API may reorder and explain only the already reviewed candidate services using strict structured output. Returned service codes are checked against the server-side catalogue before use. Any failure falls back to reviewed rules.

The configured default remains `gpt-5.6-sol`, with low reasoning effort and a stable privacy-preserving safety identifier. The implementation follows current OpenAI guidance to use the Responses API, constrain autonomy and approval boundaries, and validate structured results against application-owned data.

## API

- `POST /api/companion/assessments`
- `GET /api/companion/assessments`
- `GET /api/companion/assessments/:assessmentId`
- `PATCH /api/companion/assessments/:assessmentId/archive`

All routes require a valid session. Assessment reads and mutations are owner-scoped and mutations require CSRF protection.

## Product behavior

Each result contains the service route, reason for the match, bounded confidence, service summary, three practical next steps and a non-negotiable responsibility boundary. Same-day assessments also display an emergency-response warning because Vidhya Vedha does not replace emergency services.

Live generated ranking requires `OPENAI_API_KEY`; without it the complete reviewed-rules workflow remains operational and testable.
