require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../src/models/User");
const Listing = require("../src/models/Listing");
const Wishlist = require("../src/models/Wishlist");
const Review = require("../src/models/Review");
const Message = require("../src/models/Message");
const Notification = require("../src/models/Notification");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  await Promise.all([
    User.deleteMany({}),
    Listing.deleteMany({}),
    Wishlist.deleteMany({}),
    Review.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({})
  ]);

  const [admin, seller, buyer] = await User.create([
    { name: "Admin User", email: "admin@resellr.dev", password: "password123", role: "admin", city: "Pune" },
    { name: "Aarav Seller", email: "seller@resellr.dev", password: "password123", role: "seller", city: "Mumbai", phone: "+91 9876500001", bio: "Top-rated reseller of premium vehicles and gadgets." },
    { name: "Mira Buyer", email: "buyer@resellr.dev", password: "password123", role: "buyer", city: "Bengaluru", phone: "+91 9876500002" }
  ]);

  const listings = await Listing.create([
    {
      seller: seller._id,
      title: "2021 Hyundai Creta SX Automatic",
      description: "Single-owner SUV with sunroof, touchscreen infotainment, leatherette seats, and complete service history.",
      price: 1450000,
      category: "Cars",
      brand: "Hyundai",
      model: "Creta SX",
      year: 2021,
      location: { city: "Mumbai", state: "Maharashtra" },
      fuelType: "Petrol",
      transmission: "Automatic",
      condition: "Like New",
      images: ["/images/hyundai-creta.svg"],
      featured: true,
      status: "approved",
      aiSuggestedPrice: 1410000,
      viewCount: 84
    },
    {
      seller: seller._id,
      title: "Royal Enfield Classic 350 Chrome",
      description: "Well-maintained bike with recent service, new tyres, and all documents ready for transfer.",
      price: 162000,
      category: "Bikes",
      brand: "Royal Enfield",
      model: "Classic 350",
      year: 2020,
      location: { city: "Pune", state: "Maharashtra" },
      fuelType: "Petrol",
      transmission: "Manual",
      condition: "Used",
      images: ["/images/classic-bike.svg"],
      featured: true,
      status: "approved",
      aiSuggestedPrice: 154000,
      viewCount: 61
    },
    {
      seller: seller._id,
      title: "Apple iPhone 14 Pro 256GB",
      description: "Unlocked iPhone in excellent condition with original box and 92 percent battery health.",
      price: 82000,
      category: "Electronics",
      brand: "Apple",
      model: "iPhone 14 Pro",
      year: 2023,
      location: { city: "Bengaluru", state: "Karnataka" },
      fuelType: "N/A",
      transmission: "N/A",
      condition: "Like New",
      images: ["/images/iphone-pro.svg"],
      featured: false,
      status: "approved",
      aiSuggestedPrice: 79000,
      viewCount: 47
    }
  ]);

  await Wishlist.create({ user: buyer._id, listing: listings[0]._id });
  await Review.create({ seller: seller._id, buyer: buyer._id, listing: listings[0]._id, rating: 5, comment: "Transparent seller and quick response time." });
  await Message.create({ roomId: `${listings[0]._id}:${buyer._id}:${seller._id}`, listing: listings[0]._id, sender: buyer._id, receiver: seller._id, content: "Hi, is this still available?" });
  await Notification.create({ user: seller._id, type: "message", title: "New buyer message", body: "Hi, is this still available?", link: `/chat/${listings[0]._id}?seller=${seller._id}` });

  console.log("Seed complete.");
  console.log("Admin: admin@resellr.dev / password123");
  console.log("Seller: seller@resellr.dev / password123");
  console.log("Buyer: buyer@resellr.dev / password123");

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
