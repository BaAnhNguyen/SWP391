const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  console.log("Auth headers:", req.headers);
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    console.log("No Bearer token found in request");
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const token = h.split(" ")[1];
    console.log("Attempting to verify token:", token.substring(0, 20) + "...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("User not found for id:", decoded.userId);
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Do not have permission" });
    next();
  };

module.exports = {
  protect,
  restrictTo,
};
module.exports.restrictTo = restrictTo;
