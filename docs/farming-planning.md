# Farming pathway planning

The Farming service is a preparation and progress workspace. It does not submit applications, verify eligibility, issue benefits, take payments, or replace the responsible agricultural authority.

## Supported pathways

- Soil testing and Soil Health Card ? Department of Agriculture and Farmers Welfare (`https://soilhealth.dac.gov.in/`)
- Pradhan Mantri Fasal Bima Yojana ? Department of Agriculture and Farmers Welfare (`https://pmfby.gov.in/`)
- e-NAM market access ? Small Farmers Agribusiness Consortium (`https://enam.gov.in/web/`)
- PM-KISAN status and support ? Department of Agriculture and Farmers Welfare (`https://pmkisan.gov.in/`)

The reviewed catalogue in `Backend/data/farmingPathways.js` is the source used by both the service page and the grounded assistant. Each entry names its authority, official handoff URL, safety boundary, seasons and preparation tasks.

## Data boundary

A saved plan contains only:

- the selected pathway code;
- optional crop and district labels;
- one season value;
- checklist completion state; and
- owner, status and timestamps needed for private progress tracking.

The service deliberately has no fields for Aadhaar, bank or beneficiary numbers, land records, documents, claim evidence, payments or credentials. Those belong only on the responsible authority's official platform.

## API

Public catalogue routes:

- `GET /api/farming/pathways`
- `GET /api/farming/pathways/:pathwayCode`

Authenticated, CSRF-protected plan routes:

- `POST /api/farming/plans`
- `GET /api/farming/plans/mine`
- `PATCH /api/farming/plans/:planId/tasks/:taskCode`
- `PATCH /api/farming/plans/:planId/archive`

All plan mutations check ownership. A user cannot read or update another user's plan.

## Verification

Backend coverage verifies:

- the reviewed catalogue and sensitive-field boundary;
- minimal plan creation;
- owner-scoped list and mutation behaviour; and
- archive and task state transitions.

Frontend coverage verifies official handoff behaviour, minimal request payloads, task tracking and archive confirmation.

## Production follow-up

Official URLs and programme wording should be reviewed on a schedule because government portals and schemes can change. The service should continue to link to primary authorities and must not present a saved checklist as proof of eligibility, application submission or benefit approval.
