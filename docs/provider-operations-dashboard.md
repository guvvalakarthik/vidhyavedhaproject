# Provider operations dashboard

Phase 8 provides a role-restricted operational view for provider and admin accounts.

It aggregates healthcare appointments, roadside dispatch, home-service bookings, and assisted handoffs into status counts and active queues. Queue records deliberately exclude names, phone numbers, appointment reasons, handoff summaries, notes, vault metadata, document content, and precise emergency locations.

The dashboard is read-only. Existing service-specific, role-controlled endpoints remain responsible for operational state changes. The current provider role is workspace-wide; production onboarding should bind provider accounts to explicit provider codes before exposing organization-specific records.
