const DonationHistory = require("../models/DonationHistory");

// Lấy chi tiết 1 lần hiến máu theo id (dành cho cả member và staff)
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await DonationHistory.findById(id).populate(
      "userId",
      "name email dateOfBirth gender phoneNumber"
    );
    if (!history)
      return res.status(404).json({ error: "Không tìm thấy lịch sử này" });
    return res.json(history);
  } catch (err) {
    console.error("Error fetching detail", err);
    return res.status(500).json({ error: err.message });
  }
};
