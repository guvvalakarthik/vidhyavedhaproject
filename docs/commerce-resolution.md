# Commerce consumer-resolution cases

Ecommerce is an official-route preparation and progress workspace. It does not process payments, configure wallets, book parcel pickups, contact a merchant, submit a complaint, give legal advice or store case evidence.

## Reviewed routes

- Seller or marketplace followed by the National Consumer Helpline for non-delivery, return and refund issues.
- Regulated bank or payment provider followed by the National Cyber Crime Reporting Portal for suspected payment fraud.
- Department of Posts contacts for India Post consignments; private couriers remain responsible for their own grievance routes.
- e-Daakhil for residents preparing a formal consumer commission filing.

The catalogue is `Backend/data/commerceGuides.js` and is also available to the grounded assistant.

## Stored data

Cases contain a pathway, optional merchant/carrier nickname, optional shortened order reference, incident date, desired outcome, checklist state, owner and timestamps. There are no full order/account numbers, name, phone, email, address, payment amount, UPI ID, card/bank fields, PIN, CVV, OTP, password, wallet setup or evidence uploads.

## API

- `GET /api/ecommerce/guides`
- `GET /api/ecommerce/guides/:guideCode`
- `POST /api/ecommerce/cases` (authenticated and CSRF-protected)
- `GET /api/ecommerce/cases/mine` (authenticated)
- `PATCH /api/ecommerce/cases/:caseId/tasks/:taskId` (owner only)
- `PATCH /api/ecommerce/cases/:caseId/status` (owner only)

Cases move through `open`, `resolved` and `archived`. Archived cases are immutable. A saved case is not an official complaint, cybercrime report, postal grievance or commission filing.
