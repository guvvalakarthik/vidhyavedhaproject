import Reminder from "../models/Reminder.js";
import ReadinessChecklist from "../models/ReadinessChecklist.js";
import ServiceDraft from "../models/ServiceDraft.js";
import Notification from "../models/Notification.js";

const nextRun = (date, cadence) => {
  if (cadence === "once") return null;
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + (cadence === "daily" ? 1 : 7));
  return result;
};

export const inspectReminderTarget = async (reminder) => {
  if (reminder.sourceType === "custom") return { incomplete: true, label: reminder.title };
  if (reminder.sourceType === "readiness") {
    const item = await ReadinessChecklist.findOne({ checklistId: reminder.sourceId, userId: reminder.userId });
    if (!item) return { missing: true };
    return { incomplete: item.status === "in-progress", label: item.serviceTitle };
  }
  const item = await ServiceDraft.findOne({ draftId: reminder.sourceId, userId: reminder.userId });
  if (!item) return { missing: true };
  return { incomplete: item.status === "draft", label: item.subject };
};

export const evaluateReminder = async (reminder, now = new Date()) => {
  const target = await inspectReminderTarget(reminder);
  reminder.lastEvaluatedAt = now;
  if (target.missing || !target.incomplete) {
    reminder.status = "completed";
    reminder.completedAt = now;
    await reminder.save();
    return { outcome: target.missing ? "target-missing" : "already-complete", reminder };
  }
  await Notification.create({
    userId: reminder.userId,
    applicationId: reminder.sourceId || reminder.reminderId,
    category: "reminder",
    serviceType: target.label,
    oldStatus: "incomplete",
    newStatus: "reminder-due",
    kind: "reminder",
    reminderId: reminder.reminderId,
    message: `Reminder: ${reminder.title}. Review the task and its current official deadline before taking action.`,
  });
  reminder.lastNotifiedAt = now;
  const next = nextRun(now, reminder.cadence);
  if (next) reminder.nextRunAt = next;
  else {
    reminder.status = "completed";
    reminder.completedAt = now;
  }
  await reminder.save();
  return { outcome: "notified", reminder };
};

export const runDueReminders = async (now = new Date(), userId = null) => {
  const filter = { status: "active", nextRunAt: { $lte: now }, ...(userId ? { userId } : {}) };
  const reminders = await Reminder.find(filter).sort({ nextRunAt: 1 }).limit(100);
  const outcomes = [];
  for (const reminder of reminders) outcomes.push(await evaluateReminder(reminder, now));
  return outcomes;
};

export const startReminderWorker = () => {
  const intervalMs = Math.max(60_000, Number(process.env.REMINDER_WORKER_INTERVAL_MS) || 15 * 60_000);
  const timer = setInterval(() => runDueReminders().catch((error) => console.error("Reminder worker error:", error)), intervalMs);
  timer.unref();
  runDueReminders().catch((error) => console.error("Reminder startup scan error:", error));
  return timer;
};
