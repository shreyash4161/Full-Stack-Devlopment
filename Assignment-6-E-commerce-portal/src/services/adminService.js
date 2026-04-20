const Listing = require("../models/Listing");
const User = require("../models/User");
const { createNotification } = require("./notificationService");

async function changeListingStatus(listingId, status) {
  const listing = await Listing.findByIdAndUpdate(listingId, { status }, { new: true }).populate("seller");

  if (listing) {
    await createNotification({
      user: listing.seller._id,
      type: "listing_status",
      title: `Listing ${status}`,
      body: `${listing.title} is now ${status}.`,
      link: "/dashboard"
    });
  }

  return listing;
}

async function deleteUser(userId) {
  return User.findByIdAndDelete(userId);
}

module.exports = {
  changeListingStatus,
  deleteUser
};
