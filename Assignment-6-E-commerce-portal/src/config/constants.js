const CATEGORIES = ["Cars", "Bikes", "Electronics", "Furniture", "Others"];
const CONDITIONS = ["New", "Like New", "Used"];
const ROLES = ["buyer", "seller", "admin"];
const SORT_OPTIONS = {
  latest: { createdAt: -1 },
  priceAsc: { price: 1 },
  priceDesc: { price: -1 },
  popular: { featured: -1, viewCount: -1, createdAt: -1 }
};

module.exports = {
  CATEGORIES,
  CONDITIONS,
  ROLES,
  SORT_OPTIONS
};
