const DonationHistory = require("../models/DonationHistory");

// member view
exports.listMine = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await DonationHistory.find({ userId }).sort(
      "-donationDate"
    );
    return res.json(history);
  } catch (err) {
    console.error("Error fetching data", err);
    return res.status(500).json({ error: err.message });
  }
};

// staff view all
exports.listAll = async (req, res) => {
  try {
    const list = await DonationHistory.find()
      .populate("userId", "name email dateOfBirth gender phoneNumber ")
      .sort("-donationDate");
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
