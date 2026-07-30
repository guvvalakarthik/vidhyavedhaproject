import Reminder from "../models/Reminder.js";
import { inspectReminderTarget, runDueReminders } from "../services/reminderAgentService.js";

const output = (item) => ({
  reminderId: item.reminderId, sourceType: item.sourceType, sourceId: item.sourceId,
  title: item.title, dueAt: item.dueAt, cadence: item.cadence, channel: item.channel,
  status: item.status, nextRunAt: item.nextRunAt, lastEvaluatedAt: item.lastEvaluatedAt,
  lastNotifiedAt: item.lastNotifiedAt, completedAt: item.completedAt, createdAt: item.createdAt,
});

export const createReminder = async (req, res) => {
  const candidate = new Reminder({ ...req.body, userId: req.user.userId, nextRunAt: req.body.dueAt });
  if (candidate.sourceType !== "custom") {
    const target = await inspectReminderTarget(candidate);
    if (target.missing) return res.status(422).json({ error: "Choose an owned readiness checklist or draft." });
  }
  await candidate.save();
  return res.status(201).json({ message: "Reminder agent enabled with in-app notifications only.", reminder: output(candidate) });
};

export const listMyReminders = async (req, res) => {
  const items = await Reminder.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(50);
  return res.json({ reminders: items.map(output) });
};

export const updateReminderStatus = async (req, res) => {
  const item = await Reminder.findOne({ reminderId: req.params.reminderId, userId: req.user.userId });
  if (!item) return res.status(404).json({ error: "Reminder not found." });
  item.status = req.body.status;
  if (req.body.status === "completed") item.completedAt = new Date();
  if (req.body.status === "archived") item.archivedAt = new Date();
  if (req.body.status === "active" && item.nextRunAt < new Date()) item.nextRunAt = new Date();
  await item.save();
  return res.json({ message: `Reminder ${req.body.status}.`, reminder: output(item) });
};

export const scanMyDueReminders = async (req, res) => {
  const outcomes = await runDueReminders(new Date(), req.user.userId);
  return res.json({ message: `${outcomes.length} due reminder(s) evaluated.`, outcomes: outcomes.map(({ outcome, reminder }) => ({ outcome, reminder: output(reminder) })) });
};
