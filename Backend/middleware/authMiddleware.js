export const protect = (req, res, next) => {
  if (!req.user || !req.authSession) {
    return res.status(401).json({ error: "Your session is invalid or expired." });
  }
  return next();
};

export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: "You do not have permission to perform this action." });
  }
  return next();
};
