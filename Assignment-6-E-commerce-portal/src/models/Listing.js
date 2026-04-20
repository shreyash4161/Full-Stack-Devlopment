const mongoose = require("mongoose");
const slugify = require("slugify");

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      enum: ["Cars", "Bikes", "Electronics", "Furniture", "Others"]
    },
    brand: {
      type: String,
      trim: true,
      default: ""
    },
    model: {
      type: String,
      trim: true,
      default: ""
    },
    year: {
      type: Number,
      min: 1990
    },
    location: {
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        trim: true,
        default: ""
      }
    },
    fuelType: {
      type: String,
      trim: true,
      default: "N/A"
    },
    transmission: {
      type: String,
      trim: true,
      default: "N/A"
    },
    condition: {
      type: String,
      required: true,
      enum: ["New", "Like New", "Used"]
    },
    images: {
      type: [String],
      default: []
    },
    featured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    boostExpiresAt: Date,
    aiSuggestedPrice: Number,
    viewCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

listingSchema.index({
  title: "text",
  description: "text",
  brand: "text",
  model: "text",
  "location.city": "text"
});

listingSchema.pre("validate", function buildSlug(next) {
  if (!this.slug || this.isModified("title")) {
    const baseSlug = slugify(this.title || "listing", { lower: true, strict: true });
    this.slug = `${baseSlug}-${this._id || new mongoose.Types.ObjectId()}`.toLowerCase();
  }

  next();
});

module.exports = mongoose.model("Listing", listingSchema);
