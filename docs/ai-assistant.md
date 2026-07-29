# Grounded AI assistant

Ask Vidhya is a guidance-first citizen-services assistant. It retrieves trusted entries from the existing government, education, finance, healthcare and roadside catalogues before producing an answer, and limits write access to explicitly approved plan-task changes.

## Request flow

1. A signed-in user chooses a service area and language and asks a question.
2. The API tokenises the question and ranks matching catalogue entries.
3. When `OPENAI_API_KEY` is configured, the trusted context is sent to the OpenAI Responses API using the configured model.
4. Without an API key, the same sources are returned through a deterministic catalogue summary.
5. The UI displays the answer, responsible authority and official links.
6. The conversation and its cited responses are stored for the signed-in owner so guidance can continue across sessions.

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

### Persistent conversations

All conversation routes require an authenticated session and only return records owned by that user:

- `GET /api/ai/conversations` lists recent conversations.
- `POST /api/ai/conversations` starts a conversation.
- `GET /api/ai/conversations/:conversationId` returns its messages.
- `POST /api/ai/conversations/:conversationId/messages` sends and stores a message and the grounded response.
- `DELETE /api/ai/conversations/:conversationId` permanently deletes the conversation and its messages.

Only the most recent ten messages are supplied as bounded model context. Conversation data expires automatically after the configured retention period; each new message extends the conversation and message expiry together. Users can delete a conversation immediately from the history panel.

## Controlled agent actions

Ask Vidhya can propose one allowlisted write action: changing the status of an existing task in an education or financial plan. The model receives a compact list of the signed-in user's active plans and may call only `propose_plan_task_update` with a plan ID, task ID and target status.

A proposal does not mutate a plan. The server validates the model arguments against owner-scoped records, stores the exact pending action and requires a second authenticated request from the UI:

- `GET /api/ai/actions/pending` lists pending approvals.
- `POST /api/ai/actions/:actionId/confirm` claims and executes the exact stored action once.
- `POST /api/ai/actions/:actionId/cancel` records the rejection without changing a plan.

Approvals expire after 15 minutes. Execution rechecks ownership, active-plan status and task existence, and atomically moves the action out of `pending` before the update. Action audit records follow the conversation retention period. Deterministic matching can prepare the same bounded proposal when no API key is configured, but ambiguous requests are ignored.

## Multilingual voice UX

The browser UI supports speech input and answer playback for English, Hindi, Telugu, Tamil, Kannada, Malayalam and Marathi. Each option maps to its Indian BCP 47 speech locale (for example, `te-IN`). Controls appear only when the relevant browser speech API is available, and typing remains the fallback.

Microphone capture is initiated only after the user presses **Speak question** and stops after one utterance or when the user presses **Stop listening**. The application backend receives only the resulting text; it does not upload or store audio. Browser or operating-system speech services may process audio according to their own privacy settings and policies.

## Configuration

```dotenv
OPENAI_API_KEY=
AI_CONVERSATION_RETENTION_DAYS=90
OPENAI_MODEL=gpt-5.6-sol
```

Do not expose the API key through Vite or any browser environment variable. It belongs only in `Backend/.env` or the deployment secret store.
