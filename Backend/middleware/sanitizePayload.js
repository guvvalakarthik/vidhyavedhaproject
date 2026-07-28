const BLOCKED_KEYS = new Set(["__proto__", "prototype", "constructor"]);

const assertSafe = (value, depth = 0) => {
  if (depth > 6) throw new Error("Payload nesting is too deep.");
  if (Array.isArray(value)) {
    if (value.length > 100) throw new Error("Payload contains too many items.");
    value.forEach((item) => assertSafe(item, depth + 1));
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [key, child] of Object.entries(value)) {
    if (BLOCKED_KEYS.has(key) || key.startsWith("$") || key.includes(".")) {
      throw new Error("Payload contains a blocked field name.");
    }
    assertSafe(child, depth + 1);
  }
};

export const sanitizePayload = (req, res, next) => {
  try {
    assertSafe(req.body);
    return next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};