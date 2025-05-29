const User = require("../models/User");
const generateToken = require("../utils/jwt");

// Google callback (passport đã gắn req.user)
exports.googleCallback = (req, res) => {
  try {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/oauth2/redirect?token=${token}`);
  } catch (error) {
    console.error("Google callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

// Get current user information
exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      bloodGroup: user.bloodGroup,
      location: user.location,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
