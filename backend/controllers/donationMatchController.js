const DonationMatch = require("../models/DonationMatch");
const NeedRequest = require("../models/NeedRequest");
const User = require("../models/User");
const { sendMail, getInviteDonorMail } = require("../service/emailNeedRequest");

exports.inviteDonor = async (req, res) => {
  try {
    const { donorId, needRequestId, appointmentDate } = req.body;
    const donor = await User.findById(donorId);
    const needRequest = await NeedRequest.findById(needRequestId).populate(
      "createdBy",
      "name"
    );
    if (!donor || !needRequest)
      return res.status(404).json({ message: "Not found" });

    const match = await DonationMatch.create({
      donor: donor._id,
      needRequest: needRequest._id,
      appointmentDate,
      status: "Pending",
    });

    const confirmUrl = `${process.env.CLIENT_BASE_URL}/donationMatch/confirm/${match._id}`;

    const { subject, html } = getInviteDonorMail(
      donor.name,
      needRequest.createdBy.name,
      needRequest.bloodGroup,
      appointmentDate,
      confirmUrl
    );
    await sendMail(donor.email, subject, html);

    res.json({ message: "Send mail successfully", match });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Confirm Match
exports.confirmMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const match = await DonationMatch.findById(matchId).populate("needRequest");
    if (!match) {
      return res
        .status(404)
        .json({ status: "not_found", message: "Not found match" });
    }
    if (match.status === "Matched") {
      return res.json({ status: "already_matched", message: "Already match" });
    }
    if (match.status !== "Pending") {
      return res.json({ status: "expired", message: "Invalid or expired" });
    }

    match.status = "Matched";
    await match.save();

    if (match.needRequest) {
      match.needRequest.status = "Matched";
      await match.needRequest.save();
    }

    res.json({
      status: "success",
      message: "Bạn đã xác nhận đồng ý hiến máu! Xin cảm ơn",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
