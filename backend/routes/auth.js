const router = require("express").Router();
const passport = require("passport");
const ctrl = require("../controllers/authController");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  ctrl.googleCallback
);

module.exports = router;
