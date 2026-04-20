const fs = require("fs");
const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

const authRoutes = require("./routes/authRoutes");
const webRoutes = require("./routes/web");
const apiRoutes = require("./routes/api");
const { attachCurrentUser } = require("./middleware/auth");
const { setGlobalLocals } = require("./middleware/globals");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const publicDirectory = path.join(__dirname, "..", "public");
const clientDirectory = path.join(__dirname, "..", "client", "dist");
const hasBuiltClient = fs.existsSync(clientDirectory);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(express.static(publicDirectory));
app.use(attachCurrentUser);
app.use(setGlobalLocals);

app.use("/api", apiRoutes);

if (hasBuiltClient) {
  app.use(express.static(clientDirectory));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      next();
      return;
    }

    res.sendFile(path.join(clientDirectory, "index.html"));
  });
} else {
  app.use("/", authRoutes);
  app.use("/", webRoutes);

  app.use((req, res) => {
    res.status(404).render("error", {
      pageTitle: "Page not found",
      statusCode: 404,
      message: "The page you are looking for does not exist."
    });
  });
}

app.use(errorHandler);

module.exports = app;
