# Portfolio workflow scope

Vidhya Vedha addresses a broad problem space, but portfolio evaluation should focus
on three workflows that exercise distinct engineering problems. The remaining
modules are useful experiments and catalogue coverage; they are not presented as
nine production-ready government or commercial integrations.

## 1. Resident service companion

**Demo:** sign in → open Companion → choose a goal and domain → save guidance →
create a readiness checklist → generate and preview a draft → finalize/download
PDF → opt into a reminder → view status capability or request human assistance.

**Engineering ownership:** structured intake and validation, reviewed deterministic
recommendations, optional schema-constrained OpenAI refinement, owner authorization,
minimal-data checklist persistence, PDF generation, consent and audit boundaries,
bounded reminder worker, and connector capability states.

**Non-goal:** Vidhya Vedha does not submit an official application, decide legal
eligibility, or claim live authority status without a reviewed API connector.

## 2. Healthcare scheduling

**Demo:** browse seeded providers → load an available date → reserve a slot → view,
reschedule, or cancel the appointment → inspect the redacted provider queue with a
provider role.

**Engineering ownership:** slot generation, database uniqueness under concurrent
booking, ownership checks, allowed status transitions, redacted operational reads,
and tests for booking collisions and resident lifecycle actions.

**Non-goal:** seeded provider records are fixtures. This is not a hospital, payment,
medical-record, diagnosis, or telemedicine integration.

## 3. Roadside emergency dispatch

**Demo:** select an assistance type → provide minimum contact/location context →
create a request → assign it from the dispatcher queue → advance through allowed
states → track or cancel from the resident view.

**Engineering ownership:** role-separated dispatcher operations, validation,
minimum-data storage, explicit state machine, owner tracking, cancellation rules,
and redacted provider analytics.

**Non-goal:** the application does not contact public emergency services, guarantee
response times, or replace 112. Providers and dispatch events are demonstration data
until verified contracts and real integrations exist.

## Supporting modules

Education, finance, farming, utilities, ecommerce, and home maintenance prove that
the same privacy and ownership patterns can be adapted to other domains. They should
be described as supporting prototypes unless their integration status changes in the
central integration register.

## Evidence checklist

- Frontend tests are run only from `src`; backend tests have their own runner.
- CI executes frontend tests, backend tests, the production build, and dependency policy.
- Security controls cover opaque sessions, CSRF, RBAC, validation, rate limits,
  credential rotation, secret scanning, and dependency updates.
- Architecture, threat model, deployment, and integration-status documents describe
  what is implemented, mocked, or still operationally required.
