const router = require("express").Router();
const passport = require("passport");
const ctrl = require("../controllers/authController");
const auth = require("../middlewares/auth");

// Debug endpoint to check OAuth config
router.get("/debug", (req, res) => {
  res.json({
    redirectURI: "http://localhost:5001/api/auth/google/callback",
    googleAuthURL: "http://localhost:5001/api/auth/google",
    frontendURL: process.env.FRONTEND_URL,
    clientID: process.env.GOOGLE_CLIENT_ID,
    message: "Make sure this redirectURI is added to Google Console",
    instructions: [
      "1. Go to https://console.cloud.google.com/",
      "2. Navigate to APIs & Services → Credentials", 
      "3. Edit your OAuth 2.0 Client ID",
      "4. Add 'http://localhost:5001/api/auth/google/callback' to Authorized redirect URIs",
      "5. Add 'http://localhost:3000' and 'http://localhost:5001' to Authorized JavaScript origins"
    ]
  });
});

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

// Get current user information
router.get("/me", auth, ctrl.getCurrentUser);

module.exports = router;
