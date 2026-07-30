# Education pathway planning

The Education service is a preparation and routing layer. It does not represent
an examining body, institution, scholarship authority, admission board or
career counsellor.

## Product boundary

- Visitors can browse every pathway, review preparation steps and open the
  responsible official platform without an account.
- A browser-only checklist helps visitors think through likely evidence without
  sending it to the API.
- Signed-in users can save a plan containing only the pathway, learner stage,
  optional plain-language target, planning cycle and checklist state.
- Marks, roll numbers, identity numbers, certificates, bank details and uploaded
  documents are deliberately outside the education-plan data model.
- Official application submission, fees, verification, allocation and status
  remain with the named authority.

## Supported official routes

- National Scholarships Portal for government scholarship discovery,
  application and status.
- National Testing Agency as an examination hub, with an explicit warning that
  not every competitive examination is administered by NTA.
- NIC e-Counselling directory for finding the relevant admission and counselling
  board.
- AISHE Higher Education Institution Directory as one institution-research step.
- National Career Service for public career information and counselling support.
- Study in India for the international-student registration and admission
  journey.

Every route advises the learner to check the current official notice. The
catalogue intentionally does not duplicate deadlines, fees, eligibility
thresholds or document formats that may change each cycle.

## API

- `GET /api/education/pathways`
- `GET /api/education/pathways/:pathwayCode`
- `POST /api/education/plans`
- `GET /api/education/plans/mine`
- `PATCH /api/education/plans/:planId/tasks/:taskId`
- `PATCH /api/education/plans/:planId/archive`

Plan reads and mutations are owner-scoped. Archived plans cannot be changed.
A plan becomes complete only when every preparation task is complete.

## Primary references

- National Scholarships Portal:
  <https://www.nic.gov.in/project/national-scholarships-portal/>
- National Testing Agency: <https://www.nta.ac.in/>
- NIC e-Counselling: <https://ecounselling.nic.in/services/>
- AISHE institution directory: <https://dashboard.aishe.gov.in/>
- National Career Service: <https://www.ncs.gov.in/>
- Study in India: <https://studyinindia.gov.in/>
