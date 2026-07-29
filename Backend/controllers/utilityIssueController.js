import UtilityIssue from "../models/UtilityIssue.js";
import { UTILITY_GUIDES } from "../data/utilityGuides.js";
const guideByCode = (code) => UTILITY_GUIDES.find(({ guideCode }) => guideCode === code);
const publicIssue = (issue) => ({ issueId: issue.issueId, guideCode: issue.guideCode, guideTitle: issue.guideTitle, authority: issue.authority, officialUrl: issue.officialUrl, providerLabel: issue.providerLabel, referenceLabel: issue.referenceLabel, issueDate: issue.issueDate, tasks: issue.tasks, status: issue.status, resolvedAt: issue.resolvedAt, archivedAt: issue.archivedAt, createdAt: issue.createdAt, updatedAt: issue.updatedAt });
export const listUtilityGuides = (_req, res) => res.json({ guides: UTILITY_GUIDES });
export const getUtilityGuide = (req, res) => { const guide = guideByCode(req.params.guideCode); return guide ? res.json({ guide }) : res.status(404).json({ error: "Utility guide not found." }); };
export const createUtilityIssue = async (req, res) => {
  const guide = guideByCode(req.body.guideCode); if (!guide) return res.status(404).json({ error: "Utility guide not found." });
  const issue = await UtilityIssue.create({ userId: req.user.userId, guideCode: guide.guideCode, guideTitle: guide.title, authority: guide.authority, officialUrl: guide.officialUrl, providerLabel: req.body.providerLabel, referenceLabel: req.body.referenceLabel, issueDate: req.body.issueDate, tasks: guide.tasks });
  return res.status(201).json({ message: "Utility issue tracker created.", issue: publicIssue(issue) });
};
export const listMyUtilityIssues = async (req, res) => { const issues = await UtilityIssue.find({ userId: req.user.userId }).sort({ createdAt: -1 }); return res.json({ issues: issues.map(publicIssue) }); };
export const updateUtilityTask = async (req, res) => {
  const issue = await UtilityIssue.findOne({ issueId: req.params.issueId, userId: req.user.userId }); if (!issue) return res.status(404).json({ error: "Utility issue tracker not found." });
  if (issue.status === "archived") return res.status(409).json({ error: "Archived trackers cannot be changed." }); const task = issue.tasks.find(({ taskId }) => taskId === req.params.taskId); if (!task) return res.status(404).json({ error: "Tracker task not found." });
  task.status = req.body.completed ? "completed" : "not-started"; task.completedAt = req.body.completed ? new Date() : null; await issue.save(); return res.json({ message: "Utility issue progress updated.", issue: publicIssue(issue) });
};
export const setUtilityIssueStatus = async (req, res) => {
  const issue = await UtilityIssue.findOne({ issueId: req.params.issueId, userId: req.user.userId }); if (!issue) return res.status(404).json({ error: "Utility issue tracker not found." }); if (issue.status === "archived") return res.status(409).json({ error: "This tracker is already archived." });
  issue.status = req.body.status; issue.resolvedAt = req.body.status === "resolved" ? new Date() : issue.resolvedAt; issue.archivedAt = req.body.status === "archived" ? new Date() : null; await issue.save(); return res.json({ message: `Utility issue marked ${req.body.status}.`, issue: publicIssue(issue) });
};
