const crypto = require("crypto");

const Listing = require("../models/Listing");
const demoListings = require("../data/demoListings");
const { isMongoConnected } = require("../config/db");

const categoryImageMap = {
  Car: "/images/mahindra-thar.svg",
  Bike: "/images/classic-bike.svg",
  Electronics: "/images/iphone-pro.svg",
  Furniture: "/images/study-desk.svg",
  Property: "/images/fallback-marketplace.svg",
  Accessories: "/images/fallback-marketplace.svg"
};

const memoryListings = demoListings.map((listing) => ({
  ...listing,
  _id: crypto.randomUUID(),
  createdAt: new Date(),
  updatedAt: new Date()
}));

function normalizeListingImage(listing) {
  const fallbackImage = categoryImageMap[listing.category] || "/images/fallback-marketplace.svg";

  if (!listing.imageUrl || /^https?:\/\//i.test(listing.imageUrl)) {
    return {
      ...listing,
      imageUrl: fallbackImage
    };
  }

  return listing;
}

function normalizeListingCollection(listings) {
  return listings.map(normalizeListingImage);
}

function normalizeFilters(query = {}) {
  return {
    search: (query.search || "").trim().toLowerCase(),
    category: (query.category || "").trim(),
    condition: (query.condition || "").trim(),
    city: (query.city || "").trim().toLowerCase(),
    maxPrice: Number(query.maxPrice) || null
  };
}

function applyMemoryFilters(listings, filters) {
  return listings.filter((listing) => {
    const matchesSearch =
      !filters.search ||
      `${listing.title} ${listing.brand} ${listing.model} ${listing.description}`
        .toLowerCase()
        .includes(filters.search);

    const matchesCategory = !filters.category || listing.category === filters.category;
    const matchesCondition = !filters.condition || listing.condition === filters.condition;
    const matchesCity = !filters.city || listing.city.toLowerCase().includes(filters.city);
    const matchesMaxPrice = !filters.maxPrice || listing.price <= filters.maxPrice;

    return matchesSearch && matchesCategory && matchesCondition && matchesCity && matchesMaxPrice;
  });
}

function buildMongoQuery(filters) {
  const mongoQuery = {};

  if (filters.search) {
    mongoQuery.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { brand: { $regex: filters.search, $options: "i" } },
      { model: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } }
    ];
  }

  if (filters.category) {
    mongoQuery.category = filters.category;
  }

  if (filters.condition) {
    mongoQuery.condition = filters.condition;
  }

  if (filters.city) {
    mongoQuery.city = { $regex: filters.city, $options: "i" };
  }

  if (filters.maxPrice) {
    mongoQuery.price = { $lte: filters.maxPrice };
  }

  return mongoQuery;
}

async function getAll(query) {
  const filters = normalizeFilters(query);

  if (isMongoConnected()) {
    const listings = await Listing.find(buildMongoQuery(filters))
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    return normalizeListingCollection(listings);
  }

  return normalizeListingCollection(applyMemoryFilters(memoryListings, filters)).sort((left, right) => {
    if (left.featured === right.featured) {
      return new Date(right.createdAt) - new Date(left.createdAt);
    }

    return Number(right.featured) - Number(left.featured);
  });
}

async function getFeatured(limit = 4) {
  if (isMongoConnected()) {
    const listings = await Listing.find({ featured: true }).sort({ createdAt: -1 }).limit(limit).lean();
    return normalizeListingCollection(listings);
  }

  return normalizeListingCollection(memoryListings.filter((listing) => listing.featured).slice(0, limit));
}

async function getById(id) {
  if (isMongoConnected()) {
    const listing = await Listing.findById(id).lean();
    return listing ? normalizeListingImage(listing) : null;
  }

  const listing = memoryListings.find((listing) => listing._id === id) || null;
  return listing ? normalizeListingImage(listing) : null;
}

async function create(payload) {
  const listingData = {
    ...payload,
    year: Number(payload.year),
    price: Number(payload.price),
    mileage: Number(payload.mileage) || 0,
    featured: payload.featured === "on"
  };

  if (isMongoConnected()) {
    const createdListing = await Listing.create(listingData);
    return normalizeListingImage(createdListing.toObject());
  }

  const newListing = {
    ...listingData,
    _id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  memoryListings.unshift(newListing);
  return normalizeListingImage(newListing);
}

async function getStats() {
  if (isMongoConnected()) {
    const totalListings = await Listing.countDocuments();
    const featuredListings = await Listing.countDocuments({ featured: true });
    const averagePriceData = await Listing.aggregate([
      {
        $group: {
          _id: null,
          averagePrice: { $avg: "$price" }
        }
      }
    ]);

    return {
      totalListings,
      featuredListings,
      averagePrice: Math.round(averagePriceData[0]?.averagePrice || 0)
    };
  }

  const totalListings = memoryListings.length;
  const featuredListings = memoryListings.filter((listing) => listing.featured).length;
  const totalPrice = memoryListings.reduce((sum, listing) => sum + listing.price, 0);

  return {
    totalListings,
    featuredListings,
    averagePrice: Math.round(totalPrice / totalListings)
  };
}

module.exports = {
  getAll,
  getFeatured,
  getById,
  create,
  getStats
};
