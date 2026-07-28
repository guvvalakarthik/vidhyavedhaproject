import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const token = authHeader.slice("Bearer ".length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "vidhya-vedha-api",
      audience: "vidhya-vedha-web",
    });

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || "citizen",
    };
    return next();
  } catch {
    return res.status(401).json({ error: "Your session is invalid or expired." });
  }
};

export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: "You do not have permission to perform this action." });
  }
  return next();
};