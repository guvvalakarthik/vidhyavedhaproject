# Agentic reminders

Phase 4 adds an opt-in reminder agent for unfinished readiness checklists, unfinalized drafts, and custom tasks.

- Residents choose the task, first due time, and once/daily/weekly cadence.
- Only in-app notifications are supported.
- The worker checks ownership and completion state; completed or missing targets stop automatically.
- The agent does not submit forms, contact providers, change service records, or infer official deadlines.
- Every notification tells the resident to verify the current official deadline.
- Residents can pause, resume, complete, or archive each reminder.

The server performs an initial due scan after database startup and repeats every 15 minutes by default. `REMINDER_WORKER_INTERVAL_MS` can increase the interval but cannot reduce it below one minute.

Authenticated routes are available under `/api/reminders`.
