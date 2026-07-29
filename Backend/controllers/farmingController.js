import FarmingPlan from "../models/FarmingPlan.js";
import { FARMING_PATHWAYS } from "../data/farmingPathways.js";
import { buildFarmingTasks, farmingPlanStatus } from "../services/farmingPlanService.js";

const pathwayByCode = (code) => FARMING_PATHWAYS.find(({ pathwayCode }) => pathwayCode === code);
const publicPlan = (plan) => ({
  planId: plan.planId,
  pathwayCode: plan.pathwayCode,
  pathwayTitle: plan.pathwayTitle,
  authority: plan.authority,
  officialUrl: plan.officialUrl,
  crop: plan.crop,
  district: plan.district,
  season: plan.season,
  tasks: plan.tasks,
  status: plan.status,
  completedAt: plan.completedAt,
  archivedAt: plan.archivedAt,
  createdAt: plan.createdAt,
  updatedAt: plan.updatedAt,
});

export const listFarmingPathways = (_req, res) => res.json({ pathways: FARMING_PATHWAYS });

export const getFarmingPathway = (req, res) => {
  const pathway = pathwayByCode(req.params.pathwayCode);
  if (!pathway) return res.status(404).json({ error: "Farming pathway not found." });
  return res.json({ pathway });
};

export const createFarmingPlan = async (req, res) => {
  const pathway = pathwayByCode(req.body.pathwayCode);
  if (!pathway) return res.status(404).json({ error: "Farming pathway not found." });
  const plan = await FarmingPlan.create({
    userId: req.user.userId,
    pathwayCode: pathway.pathwayCode,
    pathwayTitle: pathway.title,
    authority: pathway.authority,
    officialUrl: pathway.officialUrl,
    crop: req.body.crop,
    district: req.body.district,
    season: req.body.season,
    tasks: buildFarmingTasks(pathway),
  });
  return res.status(201).json({ message: "Farming action plan saved.", plan: publicPlan(plan) });
};

export const listMyFarmingPlans = async (req, res) => {
  const plans = await FarmingPlan.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  return res.json({ plans: plans.map(publicPlan) });
};

export const updateFarmingTask = async (req, res) => {
  const plan = await FarmingPlan.findOne({ planId: req.params.planId, userId: req.user.userId });
  if (!plan) return res.status(404).json({ error: "Farming plan not found." });
  if (plan.status === "archived") return res.status(409).json({ error: "Archived plans cannot be changed." });
  const task = plan.tasks.find(({ taskId }) => taskId === req.params.taskId);
  if (!task) return res.status(404).json({ error: "Plan task not found." });
  task.status = req.body.completed ? "completed" : "not-started";
  task.completedAt = req.body.completed ? new Date() : null;
  plan.status = farmingPlanStatus(plan.tasks);
  plan.completedAt = plan.status === "completed" ? new Date() : null;
  await plan.save();
  return res.json({ message: "Farming plan progress updated.", plan: publicPlan(plan) });
};

export const archiveFarmingPlan = async (req, res) => {
  const plan = await FarmingPlan.findOne({ planId: req.params.planId, userId: req.user.userId });
  if (!plan) return res.status(404).json({ error: "Farming plan not found." });
  if (plan.status === "archived") return res.status(409).json({ error: "This farming plan is already archived." });
  plan.status = "archived";
  plan.archivedAt = new Date();
  await plan.save();
  return res.json({ message: "Farming plan archived.", plan: publicPlan(plan) });
};
