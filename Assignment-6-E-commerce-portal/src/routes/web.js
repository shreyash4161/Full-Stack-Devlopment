const express = require("express");
const { body } = require("express-validator");
const listingController = require("../controllers/listingController");
const dashboardController = require("../controllers/dashboardController");
const chatController = require("../controllers/chatController");
const adminController = require("../controllers/adminController");
const upload = require("../middleware/upload");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../middleware/auth");
const { CATEGORIES, CONDITIONS } = require("../config/constants");

const router = express.Router();

const listingValidation = [
  body("title").trim().isLength({ min: 4 }).withMessage("Title must be at least 4 characters."),
  body("description").trim().isLength({ min: 20 }).withMessage("Description must be at least 20 characters."),
  body("price").isFloat({ min: 1 }).withMessage("Enter a valid price."),
  body("category").isIn(CATEGORIES).withMessage("Choose a valid category."),
  body("condition").isIn(CONDITIONS).withMessage("Choose a valid condition."),
  body("city").trim().notEmpty().withMessage("City is required.")
];

router.get("/", asyncHandler(listingController.renderHome));
router.get("/marketplace", asyncHandler(listingController.renderMarketplace));
router.get("/listings/:slug", asyncHandler(listingController.renderListingDetail));
router.get("/sell", requireAuth, asyncHandler(listingController.renderCreateListing));
router.post("/sell", requireAuth, upload.array("images", 6), listingValidation, asyncHandler(listingController.createListing));
router.get("/listings/:id/edit", requireAuth, asyncHandler(listingController.renderEditListing));
router.post("/listings/:id/edit", requireAuth, upload.array("images", 6), listingValidation, asyncHandler(listingController.updateListing));
router.post("/listings/:id/delete", requireAuth, asyncHandler(listingController.deleteListing));
router.post("/listings/:id/wishlist", requireAuth, asyncHandler(listingController.toggleWishlist));
router.post("/listings/:id/reviews", requireAuth, asyncHandler(listingController.addReview));
router.get("/wishlist", requireAuth, asyncHandler(listingController.renderWishlist));
router.get("/dashboard", requireAuth, asyncHandler(dashboardController.renderDashboard));
router.get("/notifications", requireAuth, asyncHandler(dashboardController.renderNotifications));
router.post("/notifications/:id/read", requireAuth, asyncHandler(dashboardController.readNotification));
router.get("/chat", requireAuth, asyncHandler(chatController.renderInbox));
router.get("/chat/:listingId", requireAuth, asyncHandler(chatController.renderRoom));
router.post(
  "/chat/message",
  requireAuth,
  [body("content").trim().isLength({ min: 1 }).withMessage("Message cannot be empty.")],
  asyncHandler(chatController.postMessage)
);
router.post("/admin/listings/:id/approve", requireAuth, requireRole("admin"), asyncHandler(adminController.approveListing));
router.post("/admin/listings/:id/reject", requireAuth, requireRole("admin"), asyncHandler(adminController.rejectListing));
router.post("/admin/users/:id/delete", requireAuth, requireRole("admin"), asyncHandler(adminController.removeUser));

module.exports = router;
