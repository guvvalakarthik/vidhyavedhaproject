# Service drafts and downloadable PDF

Phase 3 turns preparation notes into an editable service letter while keeping the resident in control.

## What it does

- Covers application, complaint, service-request, and follow-up drafts across all nine service journeys.
- Builds a reviewed deterministic draft when `OPENAI_API_KEY` is not configured.
- Optionally uses the OpenAI Responses API with strict structured output to improve phrasing.
- Preserves user-supplied facts and instructs the model not to invent eligibility, rules, dates, fees, status, or reference numbers.
- Saves drafts against the authenticated owner, supports a review lock, and generates an A4 PDF locally with PDFKit.
- Labels every preview and PDF as `DRAFT - NOT SUBMITTED`.

## Routes

- `GET /api/drafts/templates`
- `GET /api/drafts`
- `POST /api/drafts`
- `GET /api/drafts/:draftId`
- `PUT /api/drafts/:draftId`
- `PATCH /api/drafts/:draftId/finalize`
- `PATCH /api/drafts/:draftId/archive`
- `GET /api/drafts/:draftId/pdf`

All routes require an authenticated session. Item lookups include the authenticated user ID, archived drafts cannot be downloaded, and PDF responses use `private, no-store`.

## Privacy boundary

The form requires acknowledgement that passwords, OTPs, full identity numbers, payment-card data, and unnecessary medical information must not be entered. A readiness checklist can be linked by ID, but the draft feature does not upload evidence or submit anything to a provider.

## Optional AI configuration

Set `OPENAI_API_KEY` to activate AI-assisted rewriting. `OPENAI_MODEL` defaults to `gpt-5.6-sol`. When the model call is unavailable or invalid, generation automatically returns the reviewed template.
