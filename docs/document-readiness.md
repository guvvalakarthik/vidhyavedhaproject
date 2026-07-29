# Personalized document readiness

Readiness checklists help residents prepare before opening an official or provider workflow. They record whether an item is ready, not applicable or still missing; they do not store the document or claim that a preparation item is an official requirement.

## Coverage and personalization

Templates cover all nine Vidhya Vedha journeys. A general checklist contains service-specific preparation items. When linked to an active owner-scoped Companion assessment, it also adds one goal-specific item and, where relevant, one life-stage item.

Each item is labelled as:

- `usually-needed`: a common preparation item that still needs official verification;
- `conditional`: relevant only when the authority or situation requires it; or
- `helpful`: useful preparation rather than a formal requirement.

## Privacy boundary

Only the item definition, classification and readiness state are stored. There are no file, document content, Aadhaar, account, application-number or identity-record fields. Every item tells the resident to keep documents and evidence in their own secure storage until the responsible official channel asks for them.

## API

- `GET /api/readiness/templates`
- `POST /api/readiness/checklists`
- `GET /api/readiness/checklists`
- `PATCH /api/readiness/checklists/:checklistId/items/:itemId`
- `PATCH /api/readiness/checklists/:checklistId/archive`

All routes require an authenticated session. Creation can reference an active owner assessment, item mutations are owner-scoped, and archived checklists are immutable.

The checklist becomes `ready` only when every item is either `ready` or `not-applicable`. This status means ready for official verification, not eligibility, acceptance or submission.
