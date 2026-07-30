const configuredRetentionDays = Number(process.env.AI_CONVERSATION_RETENTION_DAYS || 90);
export const retentionDays = Number.isFinite(configuredRetentionDays)
  ? Math.min(365, Math.max(1, configuredRetentionDays))
  : 90;

export const conversationExpiry = (now = new Date()) =>
  new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000);

export const conversationTitleFrom = (message) => {
  const title = String(message || "").replace(/\s+/g, " ").trim();
  if (!title) return "New conversation";
  return title.length > 64 ? `${title.slice(0, 61)}...` : title;
};
