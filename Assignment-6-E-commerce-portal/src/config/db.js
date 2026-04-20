const mongoose = require("mongoose");

let hasMongoConnection = false;

mongoose.set("strictQuery", true);

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is required to run this application.");
  }

  await mongoose.connect(mongoUri);
  hasMongoConnection = true;
  console.log("Connected to MongoDB.");
}

function isMongoConnected() {
  return hasMongoConnection;
}

module.exports = {
  connectDatabase,
  isMongoConnected
};
