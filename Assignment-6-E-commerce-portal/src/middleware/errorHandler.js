function errorHandler(error, req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Something went wrong.";

  console.error(error);

  if (req.originalUrl.startsWith("/api")) {
    res.status(statusCode).json({ message });
    return;
  }

  res.status(statusCode).render("error", {
    pageTitle: statusCode === 404 ? "Not found" : "Something went wrong",
    statusCode,
    message
  });
}

module.exports = {
  errorHandler
};
