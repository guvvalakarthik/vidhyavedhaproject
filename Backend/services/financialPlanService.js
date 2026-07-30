export const buildFinancialTasks = (pathway) =>
  pathway.tasks.map((task) => ({
    ...task,
    status: "not-started",
    completedAt: null,
  }));

export const financialPlanStatus = (tasks) =>
  tasks.length > 0 && tasks.every((task) => task.status === "completed")
    ? "completed"
    : "active";
