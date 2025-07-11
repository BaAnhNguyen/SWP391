const User = require("../models/User");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

//get current user profile
exports.getMe = async (req, res) => {
  try {
    // The user object is already attached by the auth middleware
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

//update
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

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Validate blood group if provided
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

//admin  get all users
exports.getAll = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

//admin update
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!["Member", "Staff", "Admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  res.json(user);
};

//admin delete
exports.delete = async (req, res) => {
  const { id } = req.params;
  if (await User.findByIdAndDelete(id)) res.json({ message: "User deleted" });
};

//admin ban
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

//admin unban
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
