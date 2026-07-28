const parsePart = (schema, value, part) => {
  if (!schema) return { success: true, data: value };
  const result = schema.safeParse(value);
  if (result.success) return result;

  return {
    success: false,
    issues: result.error.issues.map((issue) => ({
      field: [part, ...issue.path].join("."),
      message: issue.message,
    })),
  };
};

export const validateRequest = ({ body, params, query } = {}) => (req, res, next) => {
  const parsedBody = parsePart(body, req.body, "body");
  const parsedParams = parsePart(params, req.params, "params");
  const parsedQuery = parsePart(query, req.query, "query");
  const failed = [parsedBody, parsedParams, parsedQuery].find((result) => !result.success);

  if (failed) {
    return res.status(422).json({ error: "Validation failed.", issues: failed.issues });
  }

  if (body) req.body = parsedBody.data;
  if (params) req.params = parsedParams.data;
  if (query) req.query = parsedQuery.data;
  return next();
};