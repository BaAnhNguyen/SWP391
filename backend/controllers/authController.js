const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");
const generateToken = require("../utils/jwt");

// Local register (Member)
exports.register = async (req, res) => {
  const { name, username, email, password } = req.body;
  if (await User.exists({ $or: [{ username }, { email }] }))
    return res.status(400).json({ message: "Username/email already exits" });
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, username, email, password: hash });
  res.status(201).json({ message: "Resgiter successfully", userId: user._id });
};

// Local login (Member/Staff/Admin)
exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user?.password || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ message: "Wrong username or password" });
  res.json({
    token: generateToken(user),
    user: { name: user.name, role: user.role },
  });
};

// Google callback (passport đã gắn req.user)
exports.googleCallback = (req, res) => {
  const token = generateToken(req.user);
  res.redirect(`${process.env.FRONTEND_URL}/oauth2/redirect?token=${token}`);
};
