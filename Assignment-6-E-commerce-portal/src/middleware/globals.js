const { CATEGORIES, CONDITIONS } = require("../config/constants");
const { formatCurrency, formatDate, timeAgo } = require("../utils/viewHelpers");

function setGlobalLocals(req, res, next) {
  res.locals.currentUser = req.currentUser || null;
  res.locals.currentPath = req.path;
  res.locals.appName = process.env.APP_NAME || "Resellr";
  res.locals.categories = CATEGORIES;
  res.locals.conditions = CONDITIONS;
  res.locals.helpers = { formatCurrency, formatDate, timeAgo };
  res.locals.flash = {
    error: req.query.error || "",
    success: req.query.success || ""
  };
  next();
}

module.exports = {
  setGlobalLocals
};
