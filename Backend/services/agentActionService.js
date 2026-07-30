import AgentAction from "../models/AgentAction.js";
import EducationPlan from "../models/EducationPlan.js";
import FinancialPlan from "../models/FinancialPlan.js";
import { educationPlanStatus } from "./educationPlanService.js";
import { financialPlanStatus } from "./financialPlanService.js";
import { conversationExpiry } from "./conversationService.js";

const ACTION_TTL_MS = 15 * 60 * 1000;

export const publicAgentAction = (action) => ({
  actionId: action.actionId,
  conversationId: action.conversationId,
  actionType: action.actionType,
  planType: action.planType,
  planId: action.planId,
  taskId: action.taskId,
  taskTitle: action.taskTitle,
  completed: action.completed,
  summary: action.summary,
  status: action.status,
  result: action.result || null,
  approvalExpiresAt: action.approvalExpiresAt,
  createdAt: action.createdAt,
});

const compactPlan = (planType, plan) => ({
  planType,
  planId: plan.planId,
  planTitle: plan.pathwayTitle,
  status: plan.status,
  tasks: plan.tasks.map(({ taskId, title, status }) => ({ taskId, title, status })),
});

export const getAgentActionContext = async (userId) => {
  const [educationPlans, financialPlans] = await Promise.all([
    EducationPlan.find({ userId, status: { $ne: "archived" } }).sort({ createdAt: -1 }).limit(10).lean(),
    FinancialPlan.find({ userId, status: { $ne: "archived" } }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  return [
    ...educationPlans.map((plan) => compactPlan("education", plan)),
    ...financialPlans.map((plan) => compactPlan("finance", plan)),
  ];
};

const flattenedTasks = (context) => context.flatMap((plan) =>
  plan.tasks.map((task) => ({ ...task, planType: plan.planType, planId: plan.planId, planTitle: plan.planTitle })),
);

const exactContextProposal = (proposal, context) => {
  if (!proposal || typeof proposal !== "object") return null;
  const completed = proposal.completed;
  if (typeof completed !== "boolean") return null;
  return flattenedTasks(context).find((task) =>
    task.planType === proposal.planType
      && task.planId.toLowerCase() === String(proposal.planId || "").toLowerCase()
      && task.taskId === proposal.taskId,
  ) ? { ...proposal, completed } : null;
};

export const inferTaskAction = (question, context) => {
  const text = String(question || "").toLowerCase();
  const undoIntent = /\b(mark|set|change|move)\b.*\b(incomplete|not[- ]started|not done|unfinished)\b/.test(text);
  const completeIntent = /\b(mark|set|change|update|finish|finished|complete|completed|done)\b/.test(text);
  if (!undoIntent && !completeIntent) return null;

  const tasks = flattenedTasks(context);
  const planScoped = tasks.filter((task) => {
    const planId = task.planId.toLowerCase();
    if (!text.includes(planId)) return false;
    const taskId = task.taskId.toLowerCase();
    const title = task.title.toLowerCase();
    return text.includes(taskId) || text.includes(title);
  });
  const matches = (planScoped.length ? planScoped : tasks).filter((task) => {
    if (planScoped.length) return true;
    const taskId = task.taskId.toLowerCase();
    const title = task.title.toLowerCase();
    return text.includes(taskId) || (title.length >= 8 && text.includes(title));
  });
  if (matches.length !== 1) return null;
  const [match] = matches;
  return {
    planType: match.planType,
    planId: match.planId,
    taskId: match.taskId,
    completed: !undoIntent,
  };
};

const actionSummary = (task, completed) =>
  `${completed ? "Mark" : "Reset"} "${task.title}" ${completed ? "as completed" : "to not started"} in ${task.planTitle}.`;

export const proposeAgentAction = async ({ userId, conversationId, question, modelProposal, context }) => {
  const actionContext = context || await getAgentActionContext(userId);
  const proposal = exactContextProposal(modelProposal, actionContext)
    || inferTaskAction(question, actionContext);
  if (!proposal) return null;

  const task = flattenedTasks(actionContext).find((item) =>
    item.planType === proposal.planType
      && item.planId.toLowerCase() === proposal.planId.toLowerCase()
      && item.taskId === proposal.taskId,
  );
  if (!task || (task.status === "completed") === proposal.completed) return null;

  const existing = await AgentAction.findOne({
    userId,
    conversationId,
    planType: task.planType,
    planId: task.planId,
    taskId: task.taskId,
    completed: proposal.completed,
    status: "pending",
    approvalExpiresAt: { $gt: new Date() },
  });
  if (existing) return publicAgentAction(existing);

  const action = await AgentAction.create({
    userId,
    conversationId,
    actionType: "update-plan-task",
    planType: task.planType,
    planId: task.planId,
    taskId: task.taskId,
    taskTitle: task.title,
    completed: proposal.completed,
    summary: actionSummary(task, proposal.completed),
    approvalExpiresAt: new Date(Date.now() + ACTION_TTL_MS),
    expiresAt: conversationExpiry(),
  });
  return publicAgentAction(action);
};

const executeTaskUpdate = async (action) => {
  const isEducation = action.planType === "education";
  const Model = isEducation ? EducationPlan : FinancialPlan;
  const statusFor = isEducation ? educationPlanStatus : financialPlanStatus;
  const plan = await Model.findOne({
    userId: action.userId,
    planId: action.planId,
    status: { $ne: "archived" },
  });
  if (!plan) throw new Error("The target plan is no longer available.");
  const task = plan.tasks.find((item) => item.taskId === action.taskId);
  if (!task) throw new Error("The target task is no longer available.");

  task.status = action.completed ? "completed" : "not-started";
  task.completedAt = action.completed ? new Date() : null;
  plan.status = statusFor(plan.tasks);
  plan.completedAt = plan.status === "completed" ? new Date() : null;
  await plan.save();
  return `${action.taskTitle} is now ${action.completed ? "completed" : "not started"}.`;
};

export const confirmAgentAction = async (actionId, userId) => {
  const action = await AgentAction.findOneAndUpdate(
    { actionId, userId, status: "pending", approvalExpiresAt: { $gt: new Date() } },
    { $set: { status: "executing" } },
    { new: true },
  );
  if (!action) return null;
  try {
    action.result = await executeTaskUpdate(action);
    action.status = "confirmed";
    action.confirmedAt = new Date();
  } catch (error) {
    action.status = "failed";
    action.result = error.message;
  }
  await action.save();
  return publicAgentAction(action);
};

export const cancelAgentAction = async (actionId, userId) => {
  const action = await AgentAction.findOneAndUpdate(
    { actionId, userId, status: "pending", approvalExpiresAt: { $gt: new Date() } },
    { $set: { status: "cancelled", cancelledAt: new Date(), result: "No changes were made." } },
    { new: true },
  );
  return action ? publicAgentAction(action) : null;
};

export const listConversationActions = async (conversationId, userId) => {
  await AgentAction.updateMany(
    { conversationId, userId, status: "pending", approvalExpiresAt: { $lte: new Date() } },
    { $set: { status: "expired", result: "Approval window expired; no changes were made." } },
  );
  const actions = await AgentAction.find({ conversationId, userId }).sort({ createdAt: 1 }).limit(50);
  return actions.map(publicAgentAction);
};

export const listPendingAgentActions = async (userId) => {
  await AgentAction.updateMany(
    { userId, status: "pending", approvalExpiresAt: { $lte: new Date() } },
    { $set: { status: "expired", result: "Approval window expired; no changes were made." } },
  );
  const actions = await AgentAction.find({ userId, status: "pending" }).sort({ createdAt: -1 }).limit(50);
  return actions.map(publicAgentAction);
};
