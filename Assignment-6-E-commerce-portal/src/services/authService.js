const User = require("../models/User");
const { signToken } = require("./tokenService");

async function registerUser(payload) {
  const existingUser = await User.findOne({ email: payload.email.toLowerCase() });

  if (existingUser) {
    const error = new Error("An account with that email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    password: payload.password,
    role: payload.role,
    city: payload.city,
    phone: payload.phone,
    bio: payload.bio
  });

  return {
    user,
    token: signToken(user)
  };
}

async function loginUser(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  user.isOnline = true;
  user.lastSeenAt = new Date();
  await user.save();

  return {
    user,
    token: signToken(user)
  };
}

async function updateProfile(userId, payload) {
  return User.findByIdAndUpdate(
    userId,
    {
      name: payload.name,
      city: payload.city,
      phone: payload.phone,
      bio: payload.bio
    },
    { new: true, runValidators: true }
  );
}

async function markOffline(userId) {
  if (!userId) return;
  await User.findByIdAndUpdate(userId, { isOnline: false, lastSeenAt: new Date() });
}

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  markOffline
};
