/**
 * @fileoverview Passport.js configuration for Google OAuth 2.0 authentication
 * @description Cấu hình Passport.js để xử lý xác thực Google OAuth 2.0 cho hệ thống hiến máu SWP391
 *
 * Passport.js là middleware authentication phổ biến cho Node.js, hỗ trợ nhiều strategies khác nhau.
 * File này cấu hình Google OAuth 2.0 strategy để cho phép người dùng đăng nhập bằng tài khoản Google.
 *
 * Flow xác thực Google OAuth 2.0:
 * 1. User click "Đăng nhập bằng Google" trên frontend
 * 2. Frontend redirect đến /api/auth/google
 * 3. Passport redirect user đến Google OAuth consent screen
 * 4. User đồng ý và Google redirect về callback URL với authorization code
 * 5. Passport tự động exchange code để lấy access token và user profile
 * 6. Callback function trong file này được gọi để xử lý user profile
 * 7. System tìm hoặc tạo user trong database
 * 8. User được authenticated và redirect về frontend
 *
 * @requires passport - Core authentication middleware
 * @requires passport-google-oauth20 - Google OAuth 2.0 strategy cho Passport
 * @requires ../models/User - User model để thao tác với database
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 * @see {@link https://www.passportjs.org/packages/passport-google-oauth20/} Passport Google OAuth 2.0 docs
 */

// Import Passport core library
const passport = require("passport");

// Import Google OAuth 2.0 Strategy từ passport-google-oauth20 package
const { Strategy } = require("passport-google-oauth20");

// Import User model để thao tác với user collection trong MongoDB
const User = require("../models/User");

/**
 * Environment Variables Validation
 * @description Kiểm tra xem các environment variables cần thiết đã được set chưa
 *
 * Các biến môi trường bắt buộc:
 * - GOOGLE_CLIENT_ID: Client ID từ Google Cloud Console
 * - GOOGLE_CLIENT_SECRET: Client Secret từ Google Cloud Console
 *
 * Nếu thiếu sẽ terminate application với error code 1
 * Điều này đảm bảo application không chạy trong trạng thái misconfigured
 */
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("Error: Google OAuth credentials are missing!");
  console.error(
    "Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in your .env file"
  );
  console.error("See GOOGLE_OAUTH_SETUP.md for setup instructions");
  process.exit(1); // Exit với error code, container orchestrators sẽ detect và restart
}

/**
 * Google OAuth 2.0 Strategy Configuration
 * @description Cấu hình strategy cho Google OAuth 2.0 authentication
 *
 * Strategy options:
 * - clientID: Unique identifier cho application từ Google
 * - clientSecret: Secret key để verify application identity
 * - callbackURL: URL mà Google sẽ redirect user sau khi authentication
 *
 * Callback function sẽ được gọi sau khi Google trả về user profile
 */
passport.use(
  new Strategy(
    {
      // Client ID được cấp từ Google Cloud Console OAuth 2.0 credentials
      clientID: process.env.GOOGLE_CLIENT_ID,

      // Client Secret được cấp từ Google Cloud Console (phải được bảo mật)
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // Callback URL phải match với URL đã đăng ký trong Google Cloud Console
      // Sau khi user authorize, Google sẽ redirect về URL này với authorization code
      callbackURL: "http://localhost:5001/api/auth/google/callback",
    },

    /**
     * Google OAuth Callback Function
     * @description Function được gọi sau khi Google trả về user profile
     *
     * @param {string} _ - Access token (unused trong implementation này)
     * @param {string} __ - Refresh token (unused trong implementation này)
     * @param {Object} profile - User profile object từ Google, chứa thông tin như:
     *   - profile.id: Google user ID
     *   - profile.displayName: Tên hiển thị của user
     *   - profile.emails: Array chứa email addresses
     *   - profile.photos: Array chứa profile photos
     * @param {Function} done - Passport callback function để signal completion
     *   - done(error, user): Gọi với error nếu có lỗi, user object nếu thành công
     *   - done(null, false): Gọi nếu authentication failed nhưng không có error
     *   - done(null, user): Gọi nếu authentication thành công
     */
    async (_, __, profile, done) => {
      try {
        // Bước 1: Extract email từ Google profile
        // Google profile.emails là array, lấy email đầu tiên (primary email)
        const email = profile.emails[0].value;

        // Bước 2: Tìm kiếm existing user trong database theo email
        // Email được sử dụng làm unique identifier vì có thể user đã đăng ký trước đó
        let user = await User.findOne({ email });

        // Bước 3: Nếu user chưa tồn tại, tạo user mới
        if (!user) {
          user = await User.create({
            name: profile.displayName, // Sử dụng display name từ Google
            username: profile.id, // Sử dụng Google ID làm username (unique)
            email, // Email từ Google profile
            role: "Member", // Default role cho user mới đăng ký
          });

          console.log(
            `New user created via Google OAuth: ${user.name} (${user.email})`
          );
        } else {
          console.log(
            `Existing user authenticated via Google OAuth: ${user.name} (${user.email})`
          );
        }

        // Bước 4: Signal successful authentication với user object
        // Passport sẽ serialize user này vào session hoặc JWT token
        done(null, user);
      } catch (error) {
        // Log error để debugging và monitoring
        console.error("Error in Google OAuth callback:", error);

        // Signal authentication failure với error
        // Passport sẽ handle error và redirect user appropriately
        done(error, null);
      }
    }
  )
);

/**
 * Notes về security và best practices:
 *
 * 1. Environment Variables: Client ID và Secret phải được lưu trong .env file,
 *    không được commit vào source code repository
 *
 * 2. HTTPS in Production: Callback URL trong production environment phải sử dụng HTTPS
 *    để đảm bảo authorization code không bị intercept
 *
 * 3. Scope Management: Strategy này sử dụng default scopes (profile, email).
 *    Có thể customize scopes nếu cần thêm permissions
 *
 * 4. Error Handling: Callback function có try-catch để handle database errors
 *    và network issues khi tạo user mới
 *
 * 5. User Uniqueness: Email được sử dụng làm unique identifier.
 *    Nếu user đổi email trên Google, có thể tạo duplicate accounts
 *
 * 6. Session Management: Passport sẽ handle session serialization/deserialization
 *    dựa trên user object được return từ callback function
 */
