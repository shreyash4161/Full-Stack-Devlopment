const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer"
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    city: {
      type: String,
      trim: true,
      default: ""
    },
    bio: {
      type: String,
      trim: true,
      default: ""
    },
    avatarUrl: {
      type: String,
      default: "/images/avatar-placeholder.svg"
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeenAt: Date,
    recentlyViewed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing"
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    city: this.city,
    phone: this.phone,
    bio: this.bio,
    avatarUrl: this.avatarUrl
  };
};

module.exports = mongoose.model("User", userSchema);
