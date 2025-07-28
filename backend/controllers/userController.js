/**
 * Controller quản lý user - profile, admin operations, system config
 */
const User = require("../models/User");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const SystemConfig = require("../models/SystemConfig");

// Lấy thông tin profile của user hiện tại
exports.getMe = async (req, res) => {
  try {
    // User đã được gắn vào req qua auth middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cập nhật thông tin profile của user
exports.updateMe = async (req, res) => {
  try {
    const {
      name,
      bloodGroup,
      address,
      identityCard,
      phoneNumber,
      dateOfBirth,
      gender,
      location, // <-- thêm dòng này!
    } = req.body;

    // Kiểm tra trường bắt buộc
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Kiểm tra nhóm máu hợp lệ
    const validBloodGroups = [
      "A+",
      "A-",
      "B+",
      "B-",
      "O+",
      "O-",
      "AB+",
      "AB-",
      "unknown",
    ];
    if (bloodGroup && !validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group",
      });
    }

    let updates = { name, bloodGroup };
    if (identityCard) updates.identityCard = identityCard;
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (dateOfBirth) updates.dateOfBirth = new Date(dateOfBirth);
    if (gender) updates.gender = gender;
    if (address) updates.address = address;

    // Xử lý tọa độ địa lý cho tìm kiếm donor gần
    if (
      location &&
      typeof location.lat === "number" &&
      typeof location.lng === "number"
    ) {
      updates.location = {
        type: "Point",
        coordinates: [location.lng, location.lat], // Lưu ý: GeoJSON = [lng, lat]
      };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
      select: "-__v",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error in updateMe:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Admin lấy danh sách tất cả users
exports.getAll = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

// Admin cập nhật role của user
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!["Member", "Staff", "Admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  res.json(user);
};

// Admin xóa user
exports.delete = async (req, res) => {
  const { id } = req.params;
  if (await User.findByIdAndDelete(id)) res.json({ message: "User deleted" });
};

// Admin cấm user
exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // Chỉ Admin mới được ban
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only admin can ban users" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { isBanned: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User banned successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin bỏ cấm user
exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only admin can unban users" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { isBanned: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User unbanned successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin bật/tắt cảnh báo khẩn cấp thiếu máu
exports.toggleEmergencyAlert = async (req, res) => {
  try {
    const config = await SystemConfig.findOneAndUpdate(
      { key: "showEmergencyAlert" },
      { value: req.body.value },
      { new: true, upsert: true }
    );
    res.json({ success: true, value: config.value });
  } catch (err) {
    console.error("Error updating alert flag:", err);
    res.status(500).json({ message: "Failed to update alert flag" });
  }
};

// Lấy trạng thái cảnh báo khẩn cấp thiếu máu
exports.getEmergencyAlertStatus = async (req, res) => {
  try {
    const config = await SystemConfig.findOne({ key: "showEmergencyAlert" });
    res.json({ value: config?.value ?? false });
  } catch (err) {
    console.error("Error fetching alert flag:", err);
    res.status(500).json({ message: "Failed to fetch alert flag" });
  }
};
