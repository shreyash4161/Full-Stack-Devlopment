const { validationResult } = require("express-validator");
const Listing = require("../models/Listing");
const listingService = require("../services/listingService");
const { CATEGORIES, CONDITIONS } = require("../config/constants");

function buildFormPayload(body = {}, images = []) {
  return {
    title: body.title || "",
    description: body.description || "",
    price: body.price || "",
    category: body.category || "Cars",
    brand: body.brand || "",
    model: body.model || "",
    year: body.year || "",
    city: body.city || "",
    state: body.state || "",
    fuelType: body.fuelType || "N/A",
    transmission: body.transmission || "N/A",
    condition: body.condition || "Used",
    featured: body.featured,
    images
  };
}

async function renderHome(req, res) {
  const data = await listingService.getHomePageData();
  res.render("home", {
    pageTitle: "Modern marketplace for premium pre-owned finds",
    ...data
  });
}

async function renderMarketplace(req, res) {
  const data = await listingService.getMarketplaceData(req.query, req.currentUser?._id);
  res.render("marketplace", {
    pageTitle: "Browse marketplace",
    filters: req.query,
    ...data
  });
}

async function renderListingDetail(req, res) {
  const data = await listingService.getListingBySlug(req.params.slug, req.currentUser?._id);
  res.render("listing-detail", {
    pageTitle: data.listing.title,
    ...data
  });
}

function renderCreateListing(req, res) {
  res.render("sell-form", {
    pageTitle: "Create listing",
    formData: buildFormPayload(),
    errors: [],
    isEditing: false,
    categories: CATEGORIES,
    conditions: CONDITIONS
  });
}

async function createListing(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("sell-form", {
      pageTitle: "Create listing",
      formData: buildFormPayload(req.body),
      errors: errors.array(),
      isEditing: false,
      categories: CATEGORIES,
      conditions: CONDITIONS
    });
  }

  await listingService.createListing(req.body, req.files, req.currentUser);
  res.redirect("/dashboard?success=Listing submitted successfully");
}

async function renderEditListing(req, res) {
  const listing = await Listing.findById(req.params.id).lean();
  if (!listing) {
    return res.status(404).render("error", {
      pageTitle: "Listing not found",
      statusCode: 404,
      message: "Listing not found"
    });
  }

  res.render("sell-form", {
    pageTitle: "Edit listing",
    formData: buildFormPayload(
      {
        ...listing,
        city: listing.location?.city,
        state: listing.location?.state,
        featured: listing.featured ? "on" : ""
      },
      listing.images || []
    ),
    errors: [],
    isEditing: true,
    listingId: listing._id,
    categories: CATEGORIES,
    conditions: CONDITIONS
  });
}

async function updateListing(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("sell-form", {
      pageTitle: "Edit listing",
      formData: buildFormPayload(req.body),
      errors: errors.array(),
      isEditing: true,
      listingId: req.params.id,
      categories: CATEGORIES,
      conditions: CONDITIONS
    });
  }

  await listingService.updateListing(req.params.id, req.body, req.files, req.currentUser._id, req.currentUser.role === "admin");
  res.redirect("/dashboard?success=Listing updated successfully");
}

async function deleteListing(req, res) {
  await listingService.deleteListing(req.params.id, req.currentUser._id, req.currentUser.role === "admin");
  res.redirect("/dashboard?success=Listing removed");
}

async function toggleWishlist(req, res) {
  const result = await listingService.toggleWishlist(req.currentUser._id, req.params.id);

  if (req.originalUrl.startsWith("/api")) {
    return res.json(result);
  }

  return res.redirect(req.get("referer") || "/marketplace");
}

async function renderWishlist(req, res) {
  const wishlist = await listingService.getWishlist(req.currentUser._id);
  res.render("wishlist", {
    pageTitle: "Saved items",
    wishlist
  });
}

async function addReview(req, res) {
  await listingService.addReview(req.currentUser._id, req.params.id, req.body);
  res.redirect(req.get("referer") || "/marketplace");
}

async function suggestions(req, res) {
  const suggestions = await listingService.getSearchSuggestions(req.query.q);
  res.json({ suggestions });
}

module.exports = {
  renderHome,
  renderMarketplace,
  renderListingDetail,
  renderCreateListing,
  createListing,
  renderEditListing,
  updateListing,
  deleteListing,
  toggleWishlist,
  renderWishlist,
  addReview,
  suggestions
};
