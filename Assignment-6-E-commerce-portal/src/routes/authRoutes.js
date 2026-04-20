const express = require("express");
const { body } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.get("/login", authController.renderLogin);
router.get("/signup", authController.renderSignup);
router.post(
  "/signup",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name is required."),
    body("email").isEmail().withMessage("Enter a valid email address."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    body("role").isIn(ROLES.filter((role) => role !== "admin")).withMessage("Choose a valid role.")
  ],
  asyncHandler(authController.signup)
);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email address."),
    body("password").notEmpty().withMessage("Password is required.")
  ],
  asyncHandler(authController.login)
);
router.post("/logout", authController.logout);
router.get("/profile", requireAuth, asyncHandler(authController.renderProfile));
router.post(
  "/profile",
  requireAuth,
  [body("name").trim().isLength({ min: 2 }).withMessage("Name is required.")],
  asyncHandler(authController.updateProfile)
);

module.exports = router;
