/**
 * @fileoverview JWT Utility for Blood Donation Management System
 * @description Utility functions để tạo và xử lý JSON Web Tokens cho authentication
 *
 * Chức năng chính:
 * - Generate JWT token cho user authentication
 * - Encode user ID và role vào token payload
 * - Set expiration time cho token security
 * - Sử dụng JWT_SECRET từ environment variables
 *
 * @requires jsonwebtoken - Thư viện xử lý JWT tokens
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const jwt = require("jsonwebtoken");

/**
 * Generate JWT Token
 * @description Tạo JWT token cho user authentication
 *
 * Token payload bao gồm:
 * - userId: MongoDB ObjectId của user (để identify user)
 * - role: Role của user (Guest, Member, Staff, Admin) để authorization
 *
 * Token configuration:
 * - Secret: Sử dụng JWT_SECRET từ environment variable
 * - Expiration: 8 giờ (balance giữa security và user experience)
 *
 * @param {Object} user - User object từ database
 * @param {string} user._id - MongoDB ObjectId của user
 * @param {string} user.role - Role của user (Guest/Member/Staff/Admin)
 * @returns {string} Signed JWT token string
 *
 * @example
 * const user = { _id: '507f1f77bcf86cd799439011', role: 'Member' };
 * const token = generateToken(user);
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id, // User identifier cho database lookups
      role: user.role, // User role cho authorization checks
    },
    process.env.JWT_SECRET, // Secret key từ environment variable
    { expiresIn: "8h" } // Token expires sau 8 giờ
  );
}

/**
 * Export generateToken function
 * @description Function này được sử dụng bởi:
 * - authController.js: Tạo token sau khi login thành công
 * - Google OAuth callback: Tạo token cho user authenticate qua Google
 * - Token refresh endpoints: Tạo token mới khi cần refresh
 *
 * Security considerations:
 * - JWT_SECRET phải được bảo mật và không được expose
 * - Token expiration time phải balance giữa security và UX
 * - Payload không chứa sensitive information (chỉ userId và role)
 * - Token nên được validate ở middleware trước khi sử dụng
 */
module.exports = generateToken;
