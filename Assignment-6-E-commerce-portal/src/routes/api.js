const express = require("express");
const { body, validationResult } = require("express-validator");

const Listing = require("../models/Listing");
const Message = require("../models/Message");
const User = require("../models/User");
const Wishlist = require("../models/Wishlist");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middleware/upload");
const { requireAuth, requireRole } = require("../middleware/auth");
const { CATEGORIES, CONDITIONS, ROLES } = require("../config/constants");
const listingService = require("../services/listingService");
const dashboardService = require("../services/dashboardService");
const authService = require("../services/authService");
const chatService = require("../services/chatService");
const { setAuthCookie, clearAuthCookie } = require("../services/tokenService");

const router = express.Router();

const listingValidation = [
  body("title").trim().isLength({ min: 4 }).withMessage("Title must be at least 4 characters."),
  body("description").trim().isLength({ min: 20 }).withMessage("Description must be at least 20 characters."),
  body("price").isFloat({ min: 1 }).withMessage("Enter a valid price."),
  body("category").isIn(CATEGORIES).withMessage("Choose a valid category."),
  body("condition").isIn(CONDITIONS).withMessage("Choose a valid condition."),
  body("city").trim().notEmpty().withMessage("City is required.")
];

const signupValidation = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name is required."),
  body("email").isEmail().withMessage("Enter a valid email address."),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  body("role").optional().isIn(ROLES.filter((role) => role !== "admin")).withMessage("Choose a valid role.")
];

const loginValidation = [
  body("email").isEmail().withMessage("Enter a valid email address."),
  body("password").notEmpty().withMessage("Password is required.")
];

const reviewValidation = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Choose a rating between 1 and 5.")
];

const messageValidation = [
  body("content").trim().isLength({ min: 1 }).withMessage("Message cannot be empty."),
  body("roomId").trim().notEmpty().withMessage("Room id is required."),
  body("listingId").trim().notEmpty().withMessage("Listing id is required."),
  body("receiverId").trim().notEmpty().withMessage("Receiver id is required.")
];

function collectValidationErrors(req) {
  const result = validationResult(req);
  return result.isEmpty() ? [] : result.array();
}

function sendValidationError(res, errors) {
  return res.status(422).json({
    message: errors[0]?.msg || "Please review the highlighted fields.",
    errors
  });
}

async function buildRecommendations(currentUser) {
  const profile = currentUser
    ? await User.findById(currentUser._id).populate("recentlyViewed").lean()
    : null;

  const recentlyViewed = profile?.recentlyViewed || [];
  const preferredCategories = [...new Set(recentlyViewed.map((item) => item.category).filter(Boolean))];
  const preferredCity = profile?.city || recentlyViewed[0]?.location?.city || "";

  const recommendedQuery = {
    status: "approved"
  };

  if (preferredCategories.length > 0) {
    recommendedQuery.category = { $in: preferredCategories.slice(0, 3) };
  }

  if (preferredCity) {
    recommendedQuery["location.city"] = { $regex: preferredCity, $options: "i" };
  }

  const recommendations = await Listing.find(recommendedQuery)
    .sort({ featured: -1, viewCount: -1, createdAt: -1 })
    .limit(6)
    .populate("seller")
    .lean();

  return {
    recommendations,
    preferredCity,
    preferredCategories
  };
}

router.get(
  "/home",
  asyncHandler(async (req, res) => {
    const [home, recommendationPayload] = await Promise.all([
      listingService.getHomePageData(),
      buildRecommendations(req.currentUser)
    ]);

    res.json({
      ...home,
      ...recommendationPayload
    });
  })
);

router.get(
  "/search/suggestions",
  asyncHandler(async (req, res) => {
    const suggestions = await listingService.getSearchSuggestions(req.query.q);
    res.json({ suggestions });
  })
);

router.get(
  "/locations/suggestions",
  asyncHandler(async (req, res) => {
    const query = String(req.query.q || "").trim();
    const pipeline = [
      { $match: { status: "approved" } },
      { $group: { _id: "$location.city", count: { $sum: 1 } } },
      { $match: query ? { _id: { $regex: query, $options: "i" } } : {} },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 }
    ];

    const suggestions = await Listing.aggregate(pipeline);
    res.json({
      suggestions: suggestions.map((item) => ({
        city: item._id,
        count: item.count
      }))
    });
  })
);

router.post(
  "/auth/signup",
  signupValidation,
  asyncHandler(async (req, res) => {
    const errors = collectValidationErrors(req);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const { user, token } = await authService.registerUser({
      ...req.body,
      role: req.body.role || "buyer"
    });

    setAuthCookie(res, token);
    res.status(201).json({
      message: `Welcome ${user.name}`,
      user: user.toSafeObject()
    });
  })
);

router.post(
  "/auth/login",
  loginValidation,
  asyncHandler(async (req, res) => {
    const errors = collectValidationErrors(req);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const { user, token } = await authService.loginUser(req.body.email, req.body.password);
    setAuthCookie(res, token);

    res.json({
      message: `Welcome back ${user.name}`,
      user: user.toSafeObject()
    });
  })
);

router.post("/auth/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", (req, res) => {
  res.json({ user: req.currentUser ? req.currentUser.toSafeObject() : null });
});

router.put(
  "/auth/profile",
  requireAuth,
  [body("name").trim().isLength({ min: 2 }).withMessage("Name is required.")],
  asyncHandler(async (req, res) => {
    const errors = collectValidationErrors(req);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const user = await authService.updateProfile(req.currentUser._id, req.body);
    res.json({
      message: "Profile updated",
      user: user.toSafeObject()
    });
  })
);

router.get(
  "/listings",
  asyncHandler(async (req, res) => {
    const data = await listingService.getMarketplaceData(req.query, req.currentUser?._id);
    res.json(data);
  })
);

router.get(
  "/listings/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const myListings = await Listing.find({ seller: req.currentUser._id })
      .sort({ createdAt: -1 })
      .populate("seller")
      .lean();

    res.json({ listings: myListings });
  })
);

router.get(
  "/listings/manage/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate("seller").lean();

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (String(listing.seller._id) !== String(req.currentUser._id) && req.currentUser.role !== "admin") {
      return res.status(403).json({ message: "You are not allowed to manage this listing" });
    }

    res.json({ listing });
  })
);

router.post(
  "/listings",
  requireAuth,
  upload.array("images", 6),
  listingValidation,
  asyncHandler(async (req, res) => {
    const errors = collectValidationErrors(req);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const listing = await listingService.createListing(req.body, req.files, req.currentUser);
    res.status(201).json({
      message: "Listing published successfully",
      listing
    });
  })
);

router.get(
  "/listings/:slug",
  asyncHandler(async (req, res) => {
    const data = await listingService.getListingBySlug(req.params.slug, req.currentUser?._id);
    res.json(data);
  })
);

router.put(
  "/listings/:id",
  requireAuth,
  upload.array("images", 6),
  listingValidation,
  asyncHandler(async (req, res) => {
    const errors = collectValidationErrors(req);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const listing = await listingService.updateListing(
      req.params.id,
      req.body,
      req.files,
      req.currentUser._id,
      req.currentUser.role === "admin"
    );

    res.json({
      message: "Listing updated successfully",
      listing
    });
  })
);

router.delete(
  "/listings/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    await listingService.deleteListing(
      req.params.id,
      req.currentUser._id,
      req.currentUser.role === "admin"
    );

    res.json({ message: "Listing removed successfully" });
  })
);

router.post(
  "/listings/:id/wishlist",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await listingService.toggleWishlist(req.currentUser._id, req.params.id);
    res.json({
      message: result.saved ? "Added to wishlist" : "Removed from wishlist",
      ...result
    });
  })
);

router.get(
  "/wishlist",
  requireAuth,
  asyncHandler(async (req, res) => {
    const wishlist = await listingService.getWishlist(req.currentUser._id);
    res.json({
      items: wishlist
        .map((item) => item.listing)
        .filter(Boolean)
    });
  })
);

router.post(
  "/listings/:id/reviews",
  requireAuth,
  reviewValidation,
  asyncHandler(async (req, res) => {
    const errors = collectValidationErrors(req);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const review = await listingService.addReview(req.currentUser._id, req.params.id, req.body);
    res.status(201).json({
      message: "Review submitted successfully",
      review
    });
  })
);

router.get(
  "/dashboard",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = await dashboardService.getDashboardData(req.currentUser);
    res.json(data);
  })
);

router.get(
  "/notifications",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.currentUser._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ notifications });
  })
);

router.get(
  "/chat/inbox",
  requireAuth,
  asyncHandler(async (req, res) => {
    const conversations = await chatService.getInbox(req.currentUser._id);
    res.json({ conversations });
  })
);

router.get(
  "/chat/room/:listingId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const room = await chatService.ensureChatParticipants(
      req.params.listingId,
      req.currentUser._id,
      req.query.seller,
      req.query.buyer
    );

    const roomMessages = room.roomId ? await chatService.getRoomMessages(room.roomId) : [];

    res.json({
      activeRoom: room,
      roomMessages
    });
  })
);

router.post(
  "/chat/message",
  requireAuth,
  messageValidation,
  asyncHandler(async (req, res) => {
    const errors = collectValidationErrors(req);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const message = await chatService.saveMessage({
      roomId: req.body.roomId,
      listingId: req.body.listingId,
      senderId: req.currentUser._id,
      receiverId: req.body.receiverId,
      content: req.body.content
    });

    req.app.locals.io.to(req.body.roomId).emit("chat:message", message);
    req.app.locals.io.to(`user:${req.body.receiverId}`).emit("notification:new", {
      title: "New message",
      body: req.body.content
    });

    res.status(201).json({
      message: "Message sent",
      data: message
    });
  })
);

router.get(
  "/recommendations",
  asyncHandler(async (req, res) => {
    const payload = await buildRecommendations(req.currentUser);
    res.json(payload);
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.currentUser.toSafeObject() });
  })
);

router.get(
  "/admin/analytics",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const [users, listings, messages, featured] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Message.countDocuments(),
      Listing.countDocuments({ featured: true })
    ]);

    res.json({ users, listings, messages, featured });
  })
);

router.get(
  "/meta",
  (_req, res) => {
    res.json({
      categories: CATEGORIES,
      conditions: CONDITIONS
    });
  }
);

module.exports = router;
