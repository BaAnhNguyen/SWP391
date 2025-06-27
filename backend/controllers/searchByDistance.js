const User = require("../models/User");
const DonationHistory = require("../models/DonationHistory");

exports.searchByDistance = async (req, res) => {
  try {
    console.log("called /users/nearby");
    const { lng, lat, maxDistance } = req.query;
    if (!lng || !lat) {
      return res.status(400).json({ message: "Missing location (lng, lat)" });
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
          query: { role: "Member" },
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

    const result = users.map((user) => ({
      _id: user._id,
      name: user.name,
      bloodGroup: user.bloodGroup,
      distance: user.distance,
      nextEligibleDate: nextEligibleMap[user._id.toString()] || null,
      location: user.location,
      address: user.address,
      phoneNumber: user.phoneNumber,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
