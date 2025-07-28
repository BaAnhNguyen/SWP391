/**
 * @fileoverview Authentication Routes for Blood Donation Management System
 * @description Routes xử lý authentication qua Google OAuth 2.0 và JWT
 *
 * Chức năng chính:
 * - Google OAuth 2.0 authentication flow
 * - Debug endpoint cho OAuth configuration
 * - Get current user information với JWT protection
 * - Handle OAuth callback và JWT token generation
 *
 * @requires express.Router - Express router instance
 * @requires passport - Authentication middleware
 * @requires ../controllers/authController - Authentication controllers
 * @requires ../middlewares/auth - Authentication middleware functions
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const router = require("express").Router();
const passport = require("passport");
const ctrl = require("../controllers/authController");
const auth = require("../middlewares/auth");

/**
 * @route GET /api/auth/debug
 * @access Public
 * @description Debug endpoint để kiểm tra OAuth configuration
 *
 * Endpoint này giúp developers debug OAuth setup:
 * - Hiển thị các URLs cần thiết
 * - Kiểm tra environment variables
 * - Cung cấp hướng dẫn setup Google Console
 */
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
      "5. Add 'http://localhost:3000' and 'http://localhost:5001' to Authorized JavaScript origins",
    ],
  });
});

/**
 * @route GET /api/auth/google
 * @access Public
 * @description Initiate Google OAuth authentication
 *
 * Redirect user đến Google OAuth consent screen:
 * - Construct Google OAuth URL với các parameters cần thiết
 * - Force account selection để user có thể switch accounts
 * - Request profile và email permissions
 * - Set up offline access để có thể refresh tokens
 */
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = "http://localhost:5001/api/auth/google/callback";
  const scope = "profile email";

  // Construct Google OAuth URL với force account selection
  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=code&` +
    `prompt=select_account&` + // Force account selection screen
    `access_type=offline&` + // Request refresh token
    `include_granted_scopes=true`; // Incremental authorization

  res.redirect(googleAuthUrl);
});

/**
 * @route GET /api/auth/google/callback
 * @access Public (called by Google)
 * @description Handle Google OAuth callback
 *
 * Google sẽ redirect user về URL này sau khi authentication:
 * - Passport middleware xử lý authorization code
 * - Exchange code để lấy access token và user profile
 * - authController.googleCallback tạo JWT token và redirect về frontend
 *
 * Configuration:
 * - session: false (sử dụng JWT thay vì session)
 * - failureRedirect: Redirect về /login nếu authentication failed
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false, // Không sử dụng session, dùng JWT
    failureRedirect: "/login", // Redirect nếu authentication failed
  }),
  ctrl.googleCallback // Controller xử lý success callback
);

/**
 * @route GET /api/auth/me
 * @access Private (JWT required)
 * @description Get current authenticated user information
 *
 * Endpoint để frontend lấy thông tin user hiện tại:
 * - Require JWT token trong Authorization header
 * - auth.protect middleware verify token và load user
 * - Return user profile information
 *
 * Usage: Frontend gọi để check authentication status và user info
 */
router.get("/me", auth.protect, ctrl.getCurrentUser);

/**
 * Export authentication router
 * @description Router này handle authentication flow:
 *
 * Authentication Flow:
 * 1. Frontend redirect user đến /api/auth/google
 * 2. User authenticate với Google và consent permissions
 * 3. Google redirect về /api/auth/google/callback với authorization code
 * 4. Passport exchange code để lấy user profile
 * 5. System tạo hoặc tìm user trong database
 * 6. Generate JWT token và redirect về frontend với token
 * 7. Frontend store token và sử dụng cho subsequent requests
 * 8. Protected routes sử dụng /api/auth/me để verify user
 */
module.exports = router;
