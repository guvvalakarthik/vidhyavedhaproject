import FinancialPlan from "../models/FinancialPlan.js";
import { FINANCIAL_PATHWAYS } from "../data/financialPathways.js";
import {
  buildFinancialTasks,
  financialPlanStatus,
} from "../services/financialPlanService.js";

const pathwayByCode = (pathwayCode) =>
  FINANCIAL_PATHWAYS.find((pathway) => pathway.pathwayCode === pathwayCode);

const publicPathway = ({
  pathwayCode,
  title,
  category,
  authority,
  officialUrl,
  officialAction,
  summary,
  needCodes,
  boundary,
  preparationItems,
  watchFor,
  tasks,
}) => ({
  pathwayCode,
  title,
  category,
  authority,
  officialUrl,
  officialAction,
  summary,
  needCodes,
  boundary,
  preparationItems,
  watchFor,
  tasks,
});

const publicPlan = (plan) => ({
  planId: plan.planId,
  pathwayCode: plan.pathwayCode,
  pathwayTitle: plan.pathwayTitle,
  authority: plan.authority,
  officialUrl: plan.officialUrl,
  target: plan.target,
  planningHorizon: plan.planningHorizon,
  tasks: plan.tasks,
  status: plan.status,
  completedAt: plan.completedAt,
  archivedAt: plan.archivedAt,
  createdAt: plan.createdAt,
  updatedAt: plan.updatedAt,
});

export const listFinancialPathways = (_req, res) =>
  res.json({ pathways: FINANCIAL_PATHWAYS.map(publicPathway) });

export const getFinancialPathway = (req, res) => {
  const pathway = pathwayByCode(req.params.pathwayCode);
  if (!pathway) return res.status(404).json({ error: "Financial pathway not found." });
  return res.json({ pathway: publicPathway(pathway) });
};

export const createFinancialPlan = async (req, res) => {
  const pathway = pathwayByCode(req.body.pathwayCode);
  if (!pathway) return res.status(404).json({ error: "Financial pathway not found." });

  const plan = await FinancialPlan.create({
    userId: req.user.userId,
    pathwayCode: pathway.pathwayCode,
    pathwayTitle: pathway.title,
    authority: pathway.authority,
    officialUrl: pathway.officialUrl,
    target: req.body.target,
    planningHorizon: req.body.planningHorizon,
    tasks: buildFinancialTasks(pathway),
  });

  return res.status(201).json({
    message: "Financial preparation plan saved.",
    plan: publicPlan(plan),
  });
};

export const listMyFinancialPlans = async (req, res) => {
  const plans = await FinancialPlan.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  return res.json({ plans: plans.map(publicPlan) });
};

export const updateFinancialTask = async (req, res) => {
  const plan = await FinancialPlan.findOne({
    planId: req.params.planId,
    userId: req.user.userId,
  });
  if (!plan) return res.status(404).json({ error: "Financial plan not found." });
  if (plan.status === "archived") {
    return res.status(409).json({ error: "Archived plans cannot be changed." });
  }

  const task = plan.tasks.find((item) => item.taskId === req.params.taskId);
  if (!task) return res.status(404).json({ error: "Plan task not found." });

  task.status = req.body.completed ? "completed" : "not-started";
  task.completedAt = req.body.completed ? new Date() : null;
  plan.status = financialPlanStatus(plan.tasks);
  plan.completedAt = plan.status === "completed" ? new Date() : null;
  await plan.save();

  return res.json({ message: "Plan progress updated.", plan: publicPlan(plan) });
};

export const archiveFinancialPlan = async (req, res) => {
  const plan = await FinancialPlan.findOne({
    planId: req.params.planId,
    userId: req.user.userId,
  });
  if (!plan) return res.status(404).json({ error: "Financial plan not found." });
  if (plan.status === "archived") {
    return res.status(409).json({ error: "This financial plan is already archived." });
  }

  plan.status = "archived";
  plan.archivedAt = new Date();
  await plan.save();

  return res.json({ message: "Financial plan archived.", plan: publicPlan(plan) });
};
