const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "..", "..", "data", "bookings.json");

function ensureDataFile() {
  const directory = path.dirname(dataFilePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, "[]", "utf8");
  }
}

function readBookings() {
  ensureDataFile();

  const fileContents = fs.readFileSync(dataFilePath, "utf8").replace(/^\uFEFF/, "").trim();
  return JSON.parse(fileContents || "[]");
}

function getBookings() {
  return readBookings().slice().reverse();
}

function addBooking(booking) {
  const bookings = readBookings();

  bookings.push({
    id: Date.now().toString(),
    ...booking,
    createdAt: new Date().toISOString()
  });

  fs.writeFileSync(dataFilePath, JSON.stringify(bookings, null, 2), "utf8");
}

module.exports = {
  getBookings,
  addBooking
};