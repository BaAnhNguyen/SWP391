const DonationRegistration = require("../models/DonationRegistration");
const User = require("../models/User");
const DonationHistory = require("../models/DonationHistory");
const { sendMail } = require("../service/emailService");

//member create donation
exports.create = async (req, res) => {
  try {
    const { bloodGroup, component, readyDate } = req.body;
    const userId = req.user._id;

    //check bloodGroup in profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.bloodGroup) {
      return res.status(400).json({
        message: "You must set your bloodGroup in profile before registration",
      });
    }
    if (user.bloodGroup !== bloodGroup) {
      return res.status(400).json({ message: "Blood group mismatch" });
    }

    //validate readydate
    const currentDay = setToStartOfDay(new Date());
    const readyDateObj = setToStartOfDay(new Date(req.body.readyDate));
    if (isNaN(readyDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid format date" });
    }
    if (readyDateObj < currentDay) {
      return res
        .status(400)
        .json({ message: "Invalid date: date can not in the pass" });
    }

    const reg = await DonationRegistration.create({
      userId,
      bloodGroup,
      component,
      readyDate,
    });
    return res.status(201).json(reg);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//view donation(member)
exports.listMine = async (req, res) => {
  try {
    const userId = req.user._id;
    const regs = await DonationRegistration.find({ userId }).sort("-readyDate");
    return res.json(regs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//view all donation (staff)
exports.listAll = async (req, res) => {
  try {
    const regs = await DonationRegistration.find()
      .populate("userId", "name email bloodGroup")
      .sort("-createdAt");
    return res.json(regs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//delete (member delete when status = Pending, staff delete any reg)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const reg = await DonationRegistration.findById(id);
    if (!reg) {
      return res.status(404).json({ messsage: "Registration not found" });
    }
    //member
    if (req.user.role === "Member") {
      if (reg.status !== "Pending") {
        return res
          .status(400)
          .json({ message: "Cannot delete: status already processed" });
      }
    }

    await reg.deleteOne();
    return res.json({ message: "Registration deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
//rejected status (staff)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const reg = await DonationRegistration.findById(id);
    if (!reg)
      return res.status(404).json({ message: "Registration not found" });

    if (
      (status === "Rejected" && !rejectionReason) ||
      (status === "Cancelled" && !rejectionReason)
    ) {
      return res
        .status(400)
        .json({ message: "Rejection reason is required when rejecting" });
    }
    reg.status = status;

    if (status === "Rejected" || status === "Cancelled") {
      reg.rejectionReason = rejectionReason;
    } else {
      reg.rejectionReason = "";
    }
    await reg.save();
    return res.json(reg);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.complete = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const reg = await DonationRegistration.findById(id).populate(
      "userId",
      "name email"
    );
    if (!reg || reg.status !== "Approved")
      return res.status(400).json({ message: "Must be approved first" });

    const donationDate = new Date();
    const qty = quantity || 1;
    const nextEligibleDate = calNextEligible(reg.component, donationDate);

    await DonationHistory.create({
      userId: reg.userId,
      donationDate,
      bloodGroup: reg.bloodGroup,
      component: reg.component,
      quantity: qty,
      nextEligibleDate: nextEligibleDate,
    });

    reg.status = "Completed";
    reg.completedBy = req.user._id;
    reg.completedAt = new Date();
    await reg.save();

    let emailSent = false;

    //gui mail
    try {
      if (reg.userId && reg.userId.email) {
        await sendMail(reg.userId.email, reg.userId.name, nextEligibleDate);
        emailSent = true;
        console.log(`Email sent successfully to ${reg.userId.email}`);
      }
    } catch (emailError) {
      console.error("Failed to send email", emailError);
    }

    res.json({
      message: "Completed",
      nextEligibleDate: nextEligibleDate,
      emailSent,
      // debug: {
      //   hasUserId: !!reg.userId,
      //   hasEmail: !!reg.userId?.email,
      //   email: reg.userId?.email,
      //   name: reg.userId?.name,
      // },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//update reg
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { component, readyDate } = req.body;

    const reg = await DonationRegistration.findById(id);
    if (!reg) {
      return res.status(404).json({ message: "Registration not found" });
    }
    if (req.user.role === "Member") {
      if (reg.status !== "Pending") {
        return res
          .status(400)
          .json({ message: "Cannot update: status already processed" });
      }
    }
    if (component) reg.component = component;
    if (readyDate) reg.readyDate = readyDate;
    await reg.save();
    return res.json(reg);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//helper": calculate next eligible date
function calNextEligible(component, fromDate) {
  let day = 84;
  if (component === "Plasma") day = 14;
  else if (component === "{Platelets") day = 14;
  const d = new Date(fromDate);
  d.setDate(d.getDate() + day);
  return d;
}

function setToStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
