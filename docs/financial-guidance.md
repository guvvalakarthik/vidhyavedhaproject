# Financial guidance and preparation plans

The Money and banking service is an information and preparation layer. It does not
originate or broker credit, sell or recommend insurance, open bank accounts, perform
KYC, assess eligibility, or submit complaints for a user.

## Product journeys

The public pathway catalogue provides six distinct routes:

1. Government credit-linked schemes through JanSamarth.
2. Education finance through PM-Vidyalaxmi.
3. Basic account preparation using current PMJDY guidance and a bank-authorised channel.
4. Banking and payment complaints: complain to the regulated entity first, then use
   RBI CMS when its escalation conditions are met.
5. Insurer and intermediary checks using IRDAI information before buying.
6. Insurance grievances: contact the insurer first, then use IRDAI Bima Bharosa.

Each route identifies the responsible organisation, explains the handoff boundary,
shows an ordered process, provides a local preparation preview and highlights common
fraud or mis-selling signals.

## Loan-cost calculator

The calculator uses a standard equal-payment, reducing-balance illustration:

```text
monthly rate = annual rate / 12
payment = principal × rate × (1 + rate)^months / ((1 + rate)^months - 1)
```

A zero-interest illustration divides principal by the term. Invalid or non-positive
principal and term values are rejected.

Calculator values exist only in React component state. No amount, interest rate,
term or result is sent to the API, local storage or analytics. The result is not a
quote or eligibility decision. Users are directed to compare the lender's Key Facts
Statement, including APR and charges, before accepting credit.

## Saved plan data boundary

Authenticated users may save:

- the public `pathwayCode`;
- an optional free-text purpose label of at most 120 characters;
- a planning horizon;
- completion state for catalogue checklist tasks.

The API derives the pathway title, authority, official URL and tasks from its own
catalogue. It does not accept or store loan amount, rate, term, income, credit score,
bank or card details, policy or claim details, nominee data, OTPs, identity numbers
or uploaded documents. Zod request schemas are strict so extra fields are rejected.

Plans are owner-scoped by both `planId` and authenticated `userId`. Archived plans
cannot be changed.

## API routes

Public:

- `GET /api/finance/pathways`
- `GET /api/finance/pathways/:pathwayCode`

Authenticated:

- `POST /api/finance/plans`
- `GET /api/finance/plans/mine`
- `PATCH /api/finance/plans/:planId/tasks/:taskId`
- `PATCH /api/finance/plans/:planId/archive`

## Official references

The catalogue was checked on 28 July 2026 against:

- [Department of Financial Services: JanSamarth](https://www.financialservices.gov.in/index.php/jansamarth)
- [JanSamarth portal](https://www.jansamarth.in/home)
- [Department of Higher Education: PM-Vidyalaxmi guidelines](https://www.education.gov.in/pradhan-mantri-vidyalaxmi-pm-vidyalaxmi-scheme-guidelines)
- [PM-Vidyalaxmi portal](https://pmvidyalaxmi.co.in/)
- [Department of Financial Services: PMJDY](https://www.pmjdy.gov.in/)
- [RBI Complaint Management System](https://cms.rbi.org.in/)
- [RBI customer-service and Key Facts Statement guidance](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=9862)
- [IRDAI insurer directory](https://irdai.gov.in/insurers)
- [IRDAI grievance guidance](https://irdai.gov.in/grievance-cell-cad)
- [IRDAI Bima Bharosa](https://bimabharosa.irdai.gov.in/)

Official eligibility, coverage, documents, rates and procedures can change. The
application deliberately avoids copying promotional rates or benefit amounts into
the product catalogue.

## Production follow-up

- Review source links and route wording on a scheduled basis.
- Add content-owner approval and last-reviewed metadata before expanding the catalogue.
- Record security events for repeated ownership failures without logging plan content.
- Add multilingual plain-language versions reviewed by financial-literacy specialists.
- Obtain legal and compliance review before adding any lender, insurer, comparison,
  referral, payment, document upload or application-submission integration.
