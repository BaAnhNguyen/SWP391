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
    const { name, bloodGroup, address, identityCard, phoneNumber, dateOfBirth, gender } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Validate blood group if provided
    const validBloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    if (bloodGroup && !validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group",
      });
    } let updates = { name, bloodGroup };    // Add identity card and phone number if provided
    if (identityCard) updates.identityCard = identityCard;
    if (phoneNumber) updates.phoneNumber = phoneNumber;

    // Add date of birth and gender if provided
    if (dateOfBirth) updates.dateOfBirth = new Date(dateOfBirth);
    if (gender) updates.gender = gender;

    // Handle address updates
    if (address) {
      updates.address = address;

      try {
        // Construct a detailed address string for geocoding
        const addressParts = [
          address.street,
          address.district,
          address.city,
          address.country || "Vietnam",
        ].filter(Boolean); // Remove empty/undefined values

        const formattedAddress = addressParts
          .join(", ")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
          .replace(/[đĐ]/g, "d") // Replace đ/Đ with d
          .replace(/\s+/g, "+"); // Replace spaces with +

        const url = `https://nominatim.openstreetmap.org/search?q=${formattedAddress}&format=json&limit=1`;

        console.log("Fetching location for URL:", url); // Debug log

        const response = await fetch(url, {
          headers: {
            "User-Agent": "Blood Donation app",
            "Accept-Language": "en-US,en;q=0.9",
          },
        });

        const data = await response.json();
        console.log("Location API response:", data); // Debug log

        if (data && data.length > 0) {
          const lng = parseFloat(data[0].lon);
          const lat = parseFloat(data[0].lat);

          if (!isNaN(lng) && !isNaN(lat)) {
            updates.location = {
              type: "Point",
              coordinates: [lng, lat],
            };
            console.log("Location updated:", updates.location); // Debug log
          } else {
            console.error("Invalid coordinates received:", data[0]);
            updates.location = undefined;
          }
        } else {
          console.log("No location data found for address:", formattedAddress);
          updates.location = undefined;
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        updates.location = undefined;
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
      select: "-__v", // Exclude version key
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
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//admin and staff get all users
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
