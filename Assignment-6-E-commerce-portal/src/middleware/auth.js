const User = require("../models/User");
const { COOKIE_NAME, verifyToken } = require("../services/tokenService");

async function attachCurrentUser(req, res, next) {
  const headerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies[COOKIE_NAME] || headerToken;

  if (!token) {
    req.currentUser = null;
    next();
    return;
  }

  try {
    const payload = verifyToken(token);
    req.currentUser = await User.findById(payload.sub);
  } catch (_error) {
    req.currentUser = null;
  }

  next();
}

function requireAuth(req, res, next) {
  if (!req.currentUser) {
    if (req.originalUrl.startsWith("/api")) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
    return;
  }

  next();
}

function requireRole(...roles) {
  return function roleMiddleware(req, res, next) {
    if (!req.currentUser || !roles.includes(req.currentUser.role)) {
      if (req.originalUrl.startsWith("/api")) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      res.status(403).render("error", {
        pageTitle: "Access denied",
        statusCode: 403,
        message: "You do not have permission to access this area."
      });
      return;
    }

    next();
  };
}

module.exports = {
  attachCurrentUser,
  requireAuth,
  requireRole
};
