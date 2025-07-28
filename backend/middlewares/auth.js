/**
 * @fileoverview Authentication Middleware for Blood Donation Management System
 * @description Middleware functions để xử lý authentication và authorization
 *
 * Chức năng chính:
 * - Verify JWT tokens từ request headers
 * - Load user information từ database
 * - Check banned status của user accounts
 * - Role-based access control (RBAC)
 * - Debug logging cho troubleshooting
 *
 * @requires jsonwebtoken - Thư viện verify JWT tokens
 * @requires ../models/User - User model để lookup user info
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect Middleware - Authentication
 * @description Middleware để verify JWT token và authenticate user
 *
 * Process flow:
 * 1. Extract Bearer token từ Authorization header
 * 2. Verify token với JWT_SECRET
 * 3. Decode user ID từ token payload
 * 4. Load user từ database
 * 5. Check user ban status
 * 6. Attach user object vào req.user
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
const protect = async (req, res, next) => {
  // Debug logging để troubleshoot authentication issues
  console.log("===== AUTHENTICATION DEBUG =====");
  console.log(
    "Auth headers:",
    req.headers.authorization ? "Present" : "Missing"
  );
  console.log("Request path:", req.path);
  console.log("Request method:", req.method);

  // Bước 1: Kiểm tra Authorization header có Bearer token
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    console.log("No Bearer token found in request");
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    // Bước 2: Extract token từ "Bearer <token>" format
    const token = h.split(" ")[1];
    console.log("Attempting to verify token:", token.substring(0, 15) + "...");

    // Bước 3: Verify token với JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully, user ID:", decoded.userId);

    // Bước 4: Load user từ database theo userId trong token
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("User not found for id:", decoded.userId);
      return res.status(401).json({ message: "User not found" });
    }

    // Bước 5: Kiểm tra user có bị banned không
    if (user.isBanned) {
      return res
        .status(403)
        .json({ message: "Tài khoản của bạn đã bị khóa bởi quản trị viên." });
    }

    // Bước 6: Attach user object vào request để sử dụng trong controllers
    req.user = user;
    console.log(
      "Authentication successful for user:",
      user._id,
      "Role:",
      user.role
    );

    // Proceed to next middleware/controller
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * RestrictTo Middleware - Authorization
 * @description Higher-order function tạo middleware để check user roles
 *
 * Sử dụng Role-Based Access Control (RBAC) để restrict access:
 * - Guest: Chỉ có thể xem thông tin public
 * - Member: Có thể đăng ký hiến máu, tạo yêu cầu máu
 * - Staff: Có thể approve/reject registrations, manage inventory
 * - Admin: Full access to all system functions
 *
 * @param {...string} roles - Danh sách roles được phép truy cập
 * @returns {Function} Express middleware function
 *
 * @example
 * // Chỉ Staff và Admin có thể truy cập
 * router.get('/admin-only', protect, restrictTo('Staff', 'Admin'), controller);
 *
 * // Chỉ Member có thể truy cập
 * router.post('/donate', protect, restrictTo('Member'), donateController);
 */
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    // Kiểm tra role của user có trong danh sách allowed roles không
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Do not have permission" });

    // User có permission, proceed to next middleware/controller
    next();
  };

/**
 * Export middleware functions
 * @description Các middleware này được sử dụng bởi:
 * - Routes: Protect endpoints và role-based access control
 * - Controllers: Access user info qua req.user
 *
 * Usage patterns:
 * - protect: Dùng cho tất cả protected routes
 * - restrictTo: Dùng kèm protect cho role-specific endpoints
 *
 * Security considerations:
 * - Luôn verify token trước khi trust req.user
 * - Check ban status để prevent banned users
 * - Log security events cho audit trail
 * - Use HTTPS trong production để protect tokens
 */
module.exports = {
  protect,
  restrictTo,
};
