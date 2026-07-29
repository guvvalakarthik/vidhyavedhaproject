export const buildFarmingTasks = (pathway) => pathway.tasks.map((task) => ({
  ...task,
  status: "not-started",
  completedAt: null,
}));

export const farmingPlanStatus = (tasks) =>
  tasks.length > 0 && tasks.every((task) => task.status === "completed") ? "completed" : "active";
