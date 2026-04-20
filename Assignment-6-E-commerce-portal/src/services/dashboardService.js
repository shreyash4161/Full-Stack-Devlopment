const Listing = require("../models/Listing");
const Message = require("../models/Message");
const Wishlist = require("../models/Wishlist");
const User = require("../models/User");
const Notification = require("../models/Notification");

async function getDashboardData(user) {
  if (user.role === "admin") {
    const [usersCount, listingsCount, pendingCount, messagesCount] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Listing.countDocuments({ status: "pending" }),
      Message.countDocuments()
    ]);

    const pendingListings = await Listing.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("seller")
      .lean();

    const users = await User.find().sort({ createdAt: -1 }).limit(10).lean();

    return {
      stats: { usersCount, listingsCount, pendingCount, messagesCount },
      pendingListings,
      users,
      mode: "admin"
    };
  }

  const [myListings, wishlistCount, inboxCount, notifications, profile] = await Promise.all([
    Listing.find({ seller: user._id }).sort({ createdAt: -1 }).lean(),
    Wishlist.countDocuments({ user: user._id }),
    Message.countDocuments({ $or: [{ sender: user._id }, { receiver: user._id }] }),
    Notification.find({ user: user._id }).sort({ createdAt: -1 }).limit(6).lean(),
    User.findById(user._id).populate("recentlyViewed").lean()
  ]);

  const listingViews = myListings.reduce((sum, listing) => sum + (listing.viewCount || 0), 0);
  const pendingCount = myListings.filter((listing) => listing.status === "pending").length;
  const featuredCount = myListings.filter((listing) => listing.featured).length;

  return {
    stats: {
      totalListings: myListings.length,
      listingViews,
      wishlistCount,
      inboxCount,
      pendingCount,
      featuredCount
    },
    myListings,
    notifications,
    recentlyViewed: profile?.recentlyViewed || [],
    mode: user.role
  };
}

module.exports = {
  getDashboardData
};
