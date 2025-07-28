/**
 * @fileoverview User Model for Blood Donation Management System
 * @description Model định nghĩa schema cho collection Users trong MongoDB
 *
 * Chức năng chính:
 * - Lưu trữ thông tin cá nhân của người dùng (Member, Staff, Admin)
 * - Quản lý phân quyền thông qua role system
 * - Lưu trữ thông tin y tế (nhóm máu, thông tin sức khỏe)
 * - Hỗ trợ tìm kiếm theo vị trí địa lý (GeoJSON)
 * - Validation cho các trường quan trọng (CMND, số điện thoại)
 *
 * @requires mongoose - ODM cho MongoDB
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const { Schema, model } = require("mongoose");

/**
 * User Schema Definition
 * @description Định nghĩa cấu trúc dữ liệu cho User collection
 */
const userSchema = new Schema(
  {
    /**
     * Thông tin cơ bản của người dùng
     */

    // Họ tên đầy đủ của người dùng
    name: { type: String, required: true },

    // Email - sử dụng làm unique identifier
    email: { type: String, required: true, unique: true },

    /**
     * Hệ thống phân quyền
     * @enum {string}
     * - Guest: Khách vãng lai (chưa đăng ký)
     * - Member: Thành viên đã đăng ký (có thể hiến máu/yêu cầu máu)
     * - Staff: Nhân viên (quản lý quy trình hiến máu)
     * - Admin: Quản trị viên (toàn quyền hệ thống)
     */
    role: {
      type: String,
      enum: ["Guest", "Member", "Staff", "Admin"],
      default: "Member",
    },

    /**
     * Thông tin y tế
     */

    // Nhóm máu ABO/Rh
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "unknown"],
      default: "unknown",
    },

    /**
     * Thông tin định danh cá nhân
     */

    // Số CMND/CCCD với validation theo chuẩn Việt Nam
    identityCard: {
      type: String,
      required: [true, "Vui lòng nhập số CMND/CCCD"],
      validate: {
        validator: function (v) {
          // Regex kiểm tra CMND (9 số), CCCD cũ (12 số), CCCD mới (13 số)
          return /^(?:\d{9}|\d{12}|\d{13})$/.test(v);
        },
        message: "Số CMND/CCCD phải gồm 9, 12 hoặc 13 chữ số",
      },
    },

    // Số điện thoại với validation theo chuẩn Việt Nam
    phoneNumber: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      validate: {
        validator: function (v) {
          // Regex kiểm tra số điện thoại VN: 0xxxxxxxxx hoặc +84xxxxxxxxx
          return /^(0\d{9}|(\+84)\d{9})$/.test(v);
        },
        message:
          "Số điện thoại phải đúng định dạng Việt Nam, gồm 10 số bắt đầu bằng 0 hoặc +84",
      },
    },

    /**
     * Thông tin cá nhân bổ sung
     */

    // Ngày sinh
    dateOfBirth: { type: Date },

    // Giới tính
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    // Địa chỉ cụ thể (dạng text)
    address: { type: String },

    /**
     * Thông tin vị trí địa lý (GeoJSON format)
     * @description Sử dụng cho tính năng tìm kiếm người hiến máu gần nhất
     * Format: { type: "Point", coordinates: [longitude, latitude] }
     */
    location: {
      type: {
        type: String,
        enum: ["Point"], // Chỉ hỗ trợ Point geometry
        default: "Point",
      },
      coordinates: {
        type: [Number], // Mảng [longitude, latitude]
      },
    },

    /**
     * Trạng thái tài khoản
     */

    // Cờ đánh dấu tài khoản bị cấm
    isBanned: { type: Boolean, default: false },
  },

  // Tự động thêm createdAt và updatedAt timestamps
  { timestamps: true }
);

/**
 * Database Indexes
 * @description Tạo index để tối ưu hiệu suất truy vấn
 */

// Tạo 2dsphere index cho location để hỗ trợ geo queries
// Cho phép tìm kiếm người dùng theo vị trí địa lý
userSchema.index({ location: "2dsphere" });

// Export User model
module.exports = model("User", userSchema);
