const path = require("path");
const express = require("express");
const { destinations } = require("./src/data/destinations");
const { getBookings, addBooking } = require("./src/services/bookingService");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", {
    title: "SkyRoute Travels",
    destinations,
    bookingSuccess: req.query.booked === "1"
  });
});

app.get("/destinations/:slug", (req, res) => {
  const destination = destinations.find((item) => item.slug === req.params.slug);

  if (!destination) {
    return res.status(404).render("404", { title: "Destination Not Found" });
  }

  return res.render("destination", {
    title: `${destination.name} | SkyRoute Travels`,
    destination
  });
});

app.get("/bookings", (req, res) => {
  res.render("bookings", {
    title: "Recent Bookings",
    bookings: getBookings()
  });
});

app.post("/book-trip", (req, res) => {
  const { name, email, destination, travelers, travelDate, notes } = req.body;

  if (!name || !email || !destination || !travelDate) {
    return res.status(400).render("error", {
      title: "Missing Details",
      message: "Please fill in your name, email, destination, and travel date."
    });
  }

  addBooking({
    name,
    email,
    destination,
    travelers: travelers || "1",
    travelDate,
    notes: notes || ""
  });

  return res.redirect("/?booked=1");
});

app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

app.listen(PORT, () => {
  console.log(`SkyRoute Travels running on http://localhost:${PORT}`);
});
