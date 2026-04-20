const { validationResult } = require("express-validator");
const authService = require("../services/authService");
const { setAuthCookie, clearAuthCookie } = require("../services/tokenService");

function renderLogin(req, res) {
  res.render("auth/login", {
    pageTitle: "Welcome back",
    formData: { email: "" },
    errors: [],
    nextUrl: req.query.next || "/dashboard"
  });
}

function renderSignup(req, res) {
  res.render("auth/signup", {
    pageTitle: "Create your account",
    formData: { role: "buyer", city: "", phone: "", bio: "" },
    errors: []
  });
}

async function signup(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Create your account",
      formData: req.body,
      errors: errors.array()
    });
  }

  const { user, token } = await authService.registerUser(req.body);
  setAuthCookie(res, token);
  return res.redirect(`/dashboard?success=${encodeURIComponent(`Welcome ${user.name}`)}`);
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Welcome back",
      formData: req.body,
      errors: errors.array(),
      nextUrl: req.body.next || "/dashboard"
    });
  }

  const { user, token } = await authService.loginUser(req.body.email, req.body.password);
  setAuthCookie(res, token);
  return res.redirect(req.body.next || `/dashboard?success=${encodeURIComponent(`Welcome back ${user.name}`)}`);
}

function logout(req, res) {
  clearAuthCookie(res);
  res.redirect("/?success=Logged out successfully");
}

async function renderProfile(req, res) {
  res.render("profile", {
    pageTitle: "Your profile",
    profile: req.currentUser,
    errors: []
  });
}

async function updateProfile(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("profile", {
      pageTitle: "Your profile",
      profile: { ...req.currentUser.toObject(), ...req.body },
      errors: errors.array()
    });
  }

  await authService.updateProfile(req.currentUser._id, req.body);
  return res.redirect("/profile?success=Profile updated");
}

module.exports = {
  renderLogin,
  renderSignup,
  signup,
  login,
  logout,
  renderProfile,
  updateProfile
};
