const adminService = require("../services/adminService");

async function approveListing(req, res) {
  await adminService.changeListingStatus(req.params.id, "approved");
  res.redirect("/dashboard?success=Listing approved");
}

async function rejectListing(req, res) {
  await adminService.changeListingStatus(req.params.id, "rejected");
  res.redirect("/dashboard?success=Listing rejected");
}

async function removeUser(req, res) {
  await adminService.deleteUser(req.params.id);
  res.redirect("/dashboard?success=User removed");
}

module.exports = {
  approveListing,
  rejectListing,
  removeUser
};
