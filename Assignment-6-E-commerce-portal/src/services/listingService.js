const Listing = require("../models/Listing");
const Review = require("../models/Review");
const Wishlist = require("../models/Wishlist");
const User = require("../models/User");
const { CATEGORIES, CONDITIONS, SORT_OPTIONS } = require("../config/constants");

function buildFilterQuery(query = {}) {
  const mongoQuery = { status: "approved" };

  if (query.q) {
    mongoQuery.$text = { $search: query.q.trim() };
  }

  if (query.category && CATEGORIES.includes(query.category)) {
    mongoQuery.category = query.category;
  }

  if (query.condition && CONDITIONS.includes(query.condition)) {
    mongoQuery.condition = query.condition;
  }

  if (query.city) {
    mongoQuery["location.city"] = { $regex: query.city.trim(), $options: "i" };
  }

  if (query.minPrice || query.maxPrice) {
    mongoQuery.price = {};
    if (Number(query.minPrice)) mongoQuery.price.$gte = Number(query.minPrice);
    if (Number(query.maxPrice)) mongoQuery.price.$lte = Number(query.maxPrice);
  }

  return mongoQuery;
}

function getSort(sortBy) {
  return SORT_OPTIONS[sortBy] || SORT_OPTIONS.latest;
}

function buildPagination(page = 1, pageSize = 9) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.max(1, Math.min(24, Number(pageSize) || 9));

  return {
    page: safePage,
    limit: safeSize,
    skip: (safePage - 1) * safeSize
  };
}

function buildAiSuggestedPrice(payload) {
  const conditionMultiplier = { New: 1, "Like New": 0.88, Used: 0.72 };
  const categoryBase = { Cars: 450000, Bikes: 70000, Electronics: 25000, Furniture: 12000, Others: 15000 };
  const age = payload.year ? Math.max(0, new Date().getFullYear() - Number(payload.year)) : 0;
  const freshnessFactor = Math.max(0.45, 1 - age * 0.06);
  const featuredFactor = payload.featured ? 1.08 : 1;
  const base = categoryBase[payload.category] || categoryBase.Others;

  return Math.round(base * (conditionMultiplier[payload.condition] || 0.75) * freshnessFactor * featuredFactor);
}

function normalizeImages(files, existingImages = []) {
  const uploadedImages = Array.isArray(files)
    ? files
        .map((file) => file.path || (file.filename ? `/uploads/${file.filename}` : null))
        .filter(Boolean)
    : [];
  return uploadedImages.length > 0 ? uploadedImages : existingImages;
}

async function getHomePageData() {
  const [featuredListings, recentListings, trendingListings] = await Promise.all([
    Listing.find({ status: "approved", featured: true }).sort({ createdAt: -1 }).limit(4).populate("seller").lean(),
    Listing.find({ status: "approved" }).sort({ createdAt: -1 }).limit(8).populate("seller").lean(),
    Listing.find({ status: "approved" }).sort({ viewCount: -1, createdAt: -1 }).limit(4).populate("seller").lean()
  ]);

  const categoryCounts = await Listing.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const statsAgg = await Listing.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: null, totalListings: { $sum: 1 }, totalViews: { $sum: "$viewCount" }, averagePrice: { $avg: "$price" } } }
  ]);

  return {
    featuredListings,
    recentListings,
    trendingListings,
    categoryCounts,
    stats: statsAgg[0] || { totalListings: 0, totalViews: 0, averagePrice: 0 }
  };
}

async function getMarketplaceData(query, currentUserId) {
  const filters = buildFilterQuery(query);
  const pagination = buildPagination(query.page, query.pageSize || 9);

  const [listings, total, wishlistRows] = await Promise.all([
    Listing.find(filters).sort(getSort(query.sort)).skip(pagination.skip).limit(pagination.limit).populate("seller").lean(),
    Listing.countDocuments(filters),
    currentUserId ? Wishlist.find({ user: currentUserId }).lean() : []
  ]);

  const wishlistIds = new Set(wishlistRows.map((item) => String(item.listing)));

  return {
    listings: listings.map((listing) => ({ ...listing, isWishlisted: wishlistIds.has(String(listing._id)) })),
    total,
    pagination: {
      ...pagination,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit))
    }
  };
}

async function getListingBySlug(slug, viewerId) {
  const listing = await Listing.findOne({ slug }).populate("seller").lean();

  if (!listing) {
    const error = new Error("Listing not found.");
    error.statusCode = 404;
    throw error;
  }

  await Listing.updateOne({ _id: listing._id }, { $inc: { viewCount: 1 } });

  if (viewerId) {
    await User.findByIdAndUpdate(viewerId, { $pull: { recentlyViewed: listing._id } });
    await User.findByIdAndUpdate(viewerId, {
      $push: {
        recentlyViewed: {
          $each: [listing._id],
          $position: 0,
          $slice: 10
        }
      }
    });
  }

  const [similarListings, reviews, isWishlisted] = await Promise.all([
    Listing.find({ _id: { $ne: listing._id }, category: listing.category, status: "approved" })
      .sort({ featured: -1, createdAt: -1 })
      .limit(4)
      .populate("seller")
      .lean(),
    Review.find({ listing: listing._id }).sort({ createdAt: -1 }).populate("buyer").lean(),
    viewerId ? Wishlist.exists({ user: viewerId, listing: listing._id }) : false
  ]);

  return {
    listing,
    similarListings,
    reviews,
    isWishlisted: Boolean(isWishlisted)
  };
}

async function createListing(payload, files, user) {
  return Listing.create({
    seller: user._id,
    title: payload.title,
    description: payload.description,
    price: Number(payload.price),
    category: payload.category,
    brand: payload.brand,
    model: payload.model,
    year: payload.year ? Number(payload.year) : undefined,
    location: {
      city: payload.city,
      state: payload.state
    },
    fuelType: payload.fuelType,
    transmission: payload.transmission,
    condition: payload.condition,
    images: normalizeImages(files, []),
    featured: payload.featured === "on",
    status: user.role === "admin" ? "approved" : "pending",
    boostExpiresAt: payload.featured === "on" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
    aiSuggestedPrice: buildAiSuggestedPrice(payload)
  });
}

async function updateListing(listingId, payload, files, userId, isAdmin = false) {
  const listing = await Listing.findById(listingId);
  if (!listing) {
    const error = new Error("Listing not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!isAdmin && String(listing.seller) !== String(userId)) {
    const error = new Error("You are not allowed to edit this listing.");
    error.statusCode = 403;
    throw error;
  }

  listing.title = payload.title;
  listing.description = payload.description;
  listing.price = Number(payload.price);
  listing.category = payload.category;
  listing.brand = payload.brand;
  listing.model = payload.model;
  listing.year = payload.year ? Number(payload.year) : undefined;
  listing.location.city = payload.city;
  listing.location.state = payload.state;
  listing.fuelType = payload.fuelType;
  listing.transmission = payload.transmission;
  listing.condition = payload.condition;
  listing.images = normalizeImages(files, listing.images);
  listing.featured = payload.featured === "on";
  listing.aiSuggestedPrice = buildAiSuggestedPrice(payload);
  if (!isAdmin) listing.status = "pending";
  await listing.save();

  return listing;
}

async function deleteListing(listingId, userId, isAdmin = false) {
  const listing = await Listing.findById(listingId);
  if (!listing) return;

  if (!isAdmin && String(listing.seller) !== String(userId)) {
    const error = new Error("You are not allowed to delete this listing.");
    error.statusCode = 403;
    throw error;
  }

  await Promise.all([
    Listing.deleteOne({ _id: listingId }),
    Wishlist.deleteMany({ listing: listingId }),
    Review.deleteMany({ listing: listingId })
  ]);
}

async function toggleWishlist(userId, listingId) {
  const existing = await Wishlist.findOne({ user: userId, listing: listingId });
  if (existing) {
    await existing.deleteOne();
    return { saved: false };
  }

  await Wishlist.create({ user: userId, listing: listingId });
  return { saved: true };
}

async function getWishlist(userId) {
  return Wishlist.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({ path: "listing", populate: { path: "seller" } })
    .lean();
}

async function addReview(userId, listingId, payload) {
  const listing = await Listing.findById(listingId).populate("seller");
  if (!listing) {
    const error = new Error("Listing not found.");
    error.statusCode = 404;
    throw error;
  }

  return Review.findOneAndUpdate(
    { buyer: userId, listing: listingId },
    {
      seller: listing.seller._id,
      buyer: userId,
      listing: listingId,
      rating: Number(payload.rating),
      comment: payload.comment
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
}

async function getSearchSuggestions(queryText) {
  if (!queryText || queryText.trim().length < 2) return [];

  return Listing.find(
    {
      status: "approved",
      $or: [
        { title: { $regex: queryText.trim(), $options: "i" } },
        { brand: { $regex: queryText.trim(), $options: "i" } },
        { model: { $regex: queryText.trim(), $options: "i" } }
      ]
    },
    { title: 1, slug: 1, brand: 1, category: 1 }
  )
    .sort({ featured: -1, createdAt: -1 })
    .limit(6)
    .lean();
}

module.exports = {
  buildFilterQuery,
  buildPagination,
  getHomePageData,
  getMarketplaceData,
  getListingBySlug,
  createListing,
  updateListing,
  deleteListing,
  toggleWishlist,
  getWishlist,
  addReview,
  getSearchSuggestions,
  buildAiSuggestedPrice
};
