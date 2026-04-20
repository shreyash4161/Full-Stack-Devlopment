const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      trim: true,
      default: ""
    },
    link: {
      type: String,
      trim: true,
      default: ""
    },
    readAt: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
