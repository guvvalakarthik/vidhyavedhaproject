# Utility issue guidance and tracking

Utilities provides reviewed complaint pathways and a private progress tracker. It does not pay bills, recharge services, change provider accounts, decide disputes, or submit grievances for the user.

## Pathways

- Electricity billing or supply: distribution licensee and state grievance route, with the Ministry of Power consumer-rights rules as guidance.
- Telecom: provider complaint centre followed by the provider appellate authority, based on TRAI complaint guidance.
- LPG: distributor or oil-company support followed, when appropriate, by CPGRAMS.
- General consumer issues: the National Consumer Helpline pre-litigation route.

The reviewed catalogue is `Backend/data/utilityGuides.js` and is shared with the grounded assistant.

## Data boundary

Trackers store the pathway, optional provider nickname, optional short official complaint reference, issue date, checklist state, owner and timestamps. They have no consumer/account number, bill, bank/card/UPI data, payment mode, password, PIN, OTP, attachment or recharge amount fields.

## API

- `GET /api/utilities/guides`
- `GET /api/utilities/guides/:guideCode`
- `POST /api/utilities/issues` (authenticated and CSRF-protected)
- `GET /api/utilities/issues/mine` (authenticated)
- `PATCH /api/utilities/issues/:issueId/tasks/:taskId` (owner only)
- `PATCH /api/utilities/issues/:issueId/status` (owner only)

Status values are `tracking`, `resolved` and `archived`. Archived trackers cannot be changed.

Official URLs and procedures must be reviewed periodically. A Vidhya Vedha tracker is not an official complaint acknowledgement or proof of resolution.
