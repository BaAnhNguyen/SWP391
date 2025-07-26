const User = require("../models/User");
const DonationHistory = require("../models/DonationHistory");
const { getCompatibleBloodTypes } = require("../utils/bloodCompatibility");

exports.searchByDistance = async (req, res) => {
  try {
    const { lng, lat, maxDistance, bloodRequest } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ message: "Missing location (lng, lat)" });
    }

    if (!bloodRequest || typeof bloodRequest !== "string") {
      return res
        .status(400)
        .json({ message: "Missing or invalid blood group" });
    }

    const normalizedBloodType = bloodRequest.trim().toUpperCase();
    const compatibleTypes = getCompatibleBloodTypes(normalizedBloodType);

    if (!Array.isArray(compatibleTypes) || compatibleTypes.length === 0) {
      return res
        .status(400)
        .json({ message: "No compatible blood types found for given input." });
    }

    const distance = maxDistance ? parseInt(maxDistance) : 10000;

    const users = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: "distance",
          spherical: true,
          maxDistance: distance,
          query: { role: "Member", bloodGroup: { $in: compatibleTypes } },
        },
      },
      {
        $project: {
          name: 1,
          bloodGroup: 1,
          distance: 1,
          location: 1,
          address: 1,
          phoneNumber: 1,
        },
      },
    ]);

    if (!users) return res.json([]);

    const userIds = users.map((u) => u._id);
    const histories = await DonationHistory.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $sort: { donationDate: -1 } },
      {
        $group: {
          _id: "$userId",
          lastHistory: { $first: "$$ROOT" },
        },
      },
    ]);

    const nextEligibleMap = {};
    histories.forEach((his) => {
      nextEligibleMap[his._id.toString()] = his.lastHistory.nextEligibleDate;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = users
      .map((user) => {
        const nextDate = nextEligibleMap[user._id.toString()];
        return {
          _id: user._id,
          name: user.name,
          bloodGroup: user.bloodGroup,
          distance: user.distance,
          nextEligibleDate: nextDate || null,
          location: user.location,
          address: user.address,
          phoneNumber: user.phoneNumber,
        };
      })
      .filter((user) => {
        // Chỉ lấy người chưa từng hiến (null) hoặc đã đủ điều kiện
        if (!user.nextEligibleDate) return true;
        const next = new Date(user.nextEligibleDate);
        next.setHours(0, 0, 0, 0);
        return next <= today;
      });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
