export const buildEducationTasks = (pathway) =>
  pathway.tasks.map((task) => ({
    ...task,
    status: "not-started",
    completedAt: null,
  }));

export const educationPlanStatus = (tasks) =>
  tasks.length > 0 && tasks.every((task) => task.status === "completed")
    ? "completed"
    : "active";
