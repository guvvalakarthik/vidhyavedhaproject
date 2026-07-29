# Grounded AI assistant

Ask Vidhya is a read-only citizen-services assistant. It retrieves trusted entries from the existing government, education, finance, healthcare and roadside catalogues before producing an answer.

## Request flow

1. A signed-in user chooses a service area and language and asks a question.
2. The API tokenises the question and ranks matching catalogue entries.
3. When `OPENAI_API_KEY` is configured, the trusted context is sent to the OpenAI Responses API using the configured model.
4. Without an API key, the same sources are returned through a deterministic catalogue summary.
5. The UI displays the answer, responsible authority and official links.

The default `gpt-5.6-sol` model follows the current OpenAI model guidance. The integration uses low reasoning effort for this bounded retrieval-and-explanation task and sends a stable privacy-preserving safety identifier.

Official implementation references:

- https://developers.openai.com/api/docs/guides/latest-model
- https://developers.openai.com/api/docs/models/gpt-5.6-sol

## Safety boundaries

The system prompt and fallback both prevent the assistant from claiming to:

- determine benefit or scheme eligibility;
- diagnose or recommend medical treatment;
- approve credit or choose a financial product;
- determine roadside or emergency dispatch priority;
- submit or track an official government application;
- accept passwords, OTPs, identity numbers, banking credentials, or document uploads.

Answers must remain within retrieved context and tell users to verify changing requirements, deadlines, fees and eligibility on the linked authority website.

## API

`POST /api/ai/ask` requires an authenticated session and accepts:

```json
{
  "message": "How do I renew my passport?",
  "service": "government",
  "language": "English"
}
```

The response includes `answer`, `citations`, `mode`, and `model`. `mode` is `openai` when generation succeeds and `grounded-fallback` otherwise.

## Configuration

```dotenv
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-sol
```

Do not expose the API key through Vite or any browser environment variable. It belongs only in `Backend/.env` or the deployment secret store.
