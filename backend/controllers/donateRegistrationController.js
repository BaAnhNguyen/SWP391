const DonationRegistration = require("../models/DonationRegistration");
const User = require("../models/User");
//create donation
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

//view all donation (admin)
exports.listAll = async (req, res) => {
  try {
    const regs = await DonationRegistration.find()
      .populate("userId", "name email bloodGroup")
      .sort("-createAt");
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
//update status (staff)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const reg = await DonationRegistration.findById(id);
    if (!reg)
      return res.status(404).json({ message: "Registration not found" });

    if (status === "Rejected" && !rejectionReason) {
      return res
        .status(400)
        .json({ message: "Rejection reason is required when rejecting" });
    }
    reg.status = status;

    if (status === "Rejected") {
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
