/**
 * @fileoverview Main server file for SWP391 Blood Donation Management System
 * @description Server chính của hệ thống quản lý hiến máu SWP391
 *
 * Chức năng chính:
 * - Khởi tạo Express server với các middleware cần thiết
 * - Cấu hình CORS cho phép frontend kết nối
 * - Đăng ký các routes cho API endpoints
 * - Kết nối MongoDB database
 * - Thiết lập cron job tự động xác nhận
 * - Xử lý lỗi và 404 endpoints
 *
 * @requires dotenv - Quản lý biến môi trường
 * @requires express - Web framework cho Node.js
 * @requires mongoose - ODM cho MongoDB
 * @requires cors - Middleware xử lý Cross-Origin Resource Sharing
 * @requires passport - Middleware xác thực
 * @requires node-cron - Scheduler cho các tác vụ định kỳ
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

// Load environment variables từ file .env
require("dotenv").config();

// Import các dependencies chính
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const cron = require("node-cron");
const autoConfirmRequest = require("./service/autoConfirm");

// Load cấu hình Passport cho Google OAuth
require("./config/passport");

// Import tất cả các route modules
const authRoutes = require("./routes/auth");
const userRouter = require("./routes/user");
const donateRegistrationRoutes = require("./routes/donateRegistration");
const needRequestRoutes = require("./routes/needRequest");
const donationHistoryRoutes = require("./routes/donationHistory");
const questionRoutes = require("./routes/Question");
const bloodUnitRoutes = require("./routes/bloodUnit");
const blogRoutes = require("./routes/blog");
const commentRoutes = require("./routes/comment");

// Khởi tạo Express application
// Khởi tạo Express application
const app = express();

/**
 * MIDDLEWARE CONFIGURATION
 * Cấu hình các middleware cho Express server
 */

/**
 * CORS Configuration
 * @description Cấu hình Cross-Origin Resource Sharing để cho phép frontend kết nối
 * - origin: Chỉ định domain được phép truy cập (frontend URL)
 * - credentials: Cho phép gửi cookies và headers xác thực
 * - methods: Các HTTP methods được phép
 * - allowedHeaders: Các headers được phép trong request
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON trong request body với giới hạn kích thước mặc định
app.use(express.json());

// Parse URL-encoded data (từ HTML forms)
app.use(express.urlencoded({ extended: true }));

// Khởi tạo Passport middleware cho xác thực
// Khởi tạo Passport middleware cho xác thực
app.use(passport.initialize());

/**
 * API ROUTES REGISTRATION
 * Đăng ký các routes cho các endpoints API
 */

// Authentication routes - Xác thực người dùng (Google OAuth, JWT)
app.use("/api/auth", authRoutes);

// User management routes - Quản lý thông tin người dùng
app.use("/api/user", userRouter);

/**
 * Blood Donation System Routes
 * Các routes chính của hệ thống hiến máu
 */

// Donate Registration routes - Đăng ký hiến máu
// Đảm bảo tính nhất quán bằng cách đăng ký cả version uppercase và lowercase
app.use("/api/donateRegistration", donateRegistrationRoutes);
app.use("/api/donateregistration", donateRegistrationRoutes); // Added lowercase version

// Need Request routes - Yêu cầu máu
app.use("/api/needRequest", needRequestRoutes);

// Question routes - Câu hỏi sức khỏe cho người hiến máu
app.use("/api/question", questionRoutes);

// Blood Unit routes - Quản lý đơn vị máu trong kho
app.use("/api/bloodUnit", bloodUnitRoutes);

// Donation History routes - Lịch sử hiến máu
app.use("/api/donationHistory", donationHistoryRoutes);

// Blog routes - Bài viết/tin tức về hiến máu
app.use("/api/blogs", blogRoutes);

// Comment routes - Bình luận trên các bài viết
app.use("/api/comments", commentRoutes);

/**
 * CRON JOB CONFIGURATION
 * Cấu hình các tác vụ chạy định kỳ
 */

/**
 * Auto-confirm cron job
 * @description Chạy vào lúc 2:00 AM hàng ngày để tự động xác nhận các yêu cầu
 * Format: "phút giờ ngày tháng thứ"
 * "0 2 * * *" = 0 phút, 2 giờ, mọi ngày, mọi tháng, mọi thứ
 */
cron.schedule("0 2 * * *", async () => {
  console.log("=== Auto-confirm job start ===");
  await autoConfirmRequest();
  console.log("=== Auto-confirm job end ===");
});

/**
 * UTILITY ENDPOINTS
 * Các endpoints tiện ích
 */

/**
 * Health check endpoint
 * @route GET /api/health
 * @description Kiểm tra trạng thái server (dùng cho monitoring/load balancer)
 * @access Public
 * @returns {Object} Thông tin trạng thái server và timestamp
 */
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

/**
 * ERROR HANDLING MIDDLEWARE
 * Middleware xử lý lỗi cho toàn bộ application
 */

/**
 * Global error handler
 * @description Xử lý tất cả các lỗi không được catch ở middleware/routes khác
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

/**
 * 404 handler
 * @description Xử lý các request đến routes không tồn tại
 * @param {string} * - Bắt tất cả các routes không được định nghĩa
 */
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/**
 * SERVER CONFIGURATION & DATABASE CONNECTION
 * Cấu hình server và kết nối database
 */

// Lấy PORT từ environment variable hoặc sử dụng default 5000
const PORT = process.env.PORT || 5000;

// Lấy MongoDB URI từ environment variable hoặc sử dụng local database
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/swp391";

/**
 * Database connection và server startup
 * @description Kết nối MongoDB và khởi động server
 *
 * Flow khởi động:
 * 1. Kết nối MongoDB với các options cần thiết
 * 2. Nếu kết nối thành công -> khởi động Express server
 * 3. Nếu kết nối thất bại -> log error và thoát process
 */
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true, // Sử dụng MongoDB connection string parser mới
    useUnifiedTopology: true, // Sử dụng MongoDB unified topology engine mới
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Khởi động server sau khi kết nối database thành công
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1); // Thoát process với error code 1
  });
