import EducationPlan from "../models/EducationPlan.js";
import { EDUCATION_PATHWAYS } from "../data/educationPathways.js";
import {
  buildEducationTasks,
  educationPlanStatus,
} from "../services/educationPlanService.js";

const pathwayByCode = (pathwayCode) =>
  EDUCATION_PATHWAYS.find((pathway) => pathway.pathwayCode === pathwayCode);

const publicPlan = (plan) => ({
  planId: plan.planId,
  pathwayCode: plan.pathwayCode,
  pathwayTitle: plan.pathwayTitle,
  authority: plan.authority,
  officialUrl: plan.officialUrl,
  learnerStage: plan.learnerStage,
  target: plan.target,
  targetCycle: plan.targetCycle,
  tasks: plan.tasks,
  status: plan.status,
  completedAt: plan.completedAt,
  archivedAt: plan.archivedAt,
  createdAt: plan.createdAt,
  updatedAt: plan.updatedAt,
});

export const listEducationPathways = (_req, res) =>
  res.json({ pathways: EDUCATION_PATHWAYS });

export const getEducationPathway = (req, res) => {
  const pathway = pathwayByCode(req.params.pathwayCode);
  if (!pathway) return res.status(404).json({ error: "Education pathway not found." });
  return res.json({ pathway });
};

export const createEducationPlan = async (req, res) => {
  const pathway = pathwayByCode(req.body.pathwayCode);
  if (!pathway) return res.status(404).json({ error: "Education pathway not found." });
  if (!pathway.learnerStages.includes(req.body.learnerStage)) {
    return res.status(422).json({
      error: "This pathway does not match the selected learner stage. Review the pathway before saving.",
    });
  }

  const plan = await EducationPlan.create({
    userId: req.user.userId,
    pathwayCode: pathway.pathwayCode,
    pathwayTitle: pathway.title,
    authority: pathway.authority,
    officialUrl: pathway.officialUrl,
    learnerStage: req.body.learnerStage,
    target: req.body.target,
    targetCycle: req.body.targetCycle,
    tasks: buildEducationTasks(pathway),
  });
  return res.status(201).json({
    message: "Education action plan saved.",
    plan: publicPlan(plan),
  });
};

export const listMyEducationPlans = async (req, res) => {
  const plans = await EducationPlan.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  return res.json({ plans: plans.map(publicPlan) });
};

export const updateEducationTask = async (req, res) => {
  const plan = await EducationPlan.findOne({
    planId: req.params.planId,
    userId: req.user.userId,
  });
  if (!plan) return res.status(404).json({ error: "Education plan not found." });
  if (plan.status === "archived") {
    return res.status(409).json({ error: "Archived plans cannot be changed." });
  }

  const task = plan.tasks.find((item) => item.taskId === req.params.taskId);
  if (!task) return res.status(404).json({ error: "Plan task not found." });

  task.status = req.body.completed ? "completed" : "not-started";
  task.completedAt = req.body.completed ? new Date() : null;
  plan.status = educationPlanStatus(plan.tasks);
  plan.completedAt = plan.status === "completed" ? new Date() : null;
  await plan.save();

  return res.json({ message: "Plan progress updated.", plan: publicPlan(plan) });
};

export const archiveEducationPlan = async (req, res) => {
  const plan = await EducationPlan.findOne({
    planId: req.params.planId,
    userId: req.user.userId,
  });
  if (!plan) return res.status(404).json({ error: "Education plan not found." });
  if (plan.status === "archived") {
    return res.status(409).json({ error: "This education plan is already archived." });
  }

  plan.status = "archived";
  plan.archivedAt = new Date();
  await plan.save();
  return res.json({ message: "Education plan archived.", plan: publicPlan(plan) });
};
