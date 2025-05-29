const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer "))
    return res.status(401).json({ message: "Not login" });
  try {
    req.user = jwt.verify(h.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Do not have permission" });
    next();
  };
