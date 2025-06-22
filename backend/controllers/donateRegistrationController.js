const DonationRegistration = require("../models/DonationRegistration");
const User = require("../models/User");
const DonationHistory = require("../models/DonationHistory");
const { sendMail } = require("../service/emailService");

//member create donation
exports.create = async (req, res) => {
  try {
    console.log(
      "Nhận request tạo đơn hiến máu:",
      JSON.stringify(req.body, null, 2)
    );
    const { bloodGroup, component, readyDate, screening, confirmation } =
      req.body;
    const userId = req.user._id;

    //check bloodGroup in profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //valide update profile
    if (
      !user.dateOfBirth ||
      !user.gender ||
      !user.phoneNumber ||
      !user.identityCard ||
      !user.bloodGroup
    ) {
      return res
        .status(400)
        .json({ message: "You need to update your profile" });
    }
    if (!isEligibleToDonateBlood(user.dateOfBirth)) {
      return res.status(400).json({
        message: "Your age must be between 18 and 60",
      });
    }
    if (user.bloodGroup !== bloodGroup) {
      return res.status(400).json({ message: "Blood group mismatch" });
    }

    //validate readydate
    try {
      const currentDay = setToStartOfDay(new Date());
      const readyDateObj = setToStartOfDay(new Date(readyDate));
      if (isNaN(readyDateObj.getTime())) {
        return res.status(400).json({ message: "Invalid format date" });
      }
      if (readyDateObj < currentDay) {
        return res
          .status(400)
          .json({ message: "Invalid date: date can not be in the past" });
      }
    } catch (dateError) {
      console.error("Date validation error:", dateError);
      return res
        .status(400)
        .json({ message: "Invalid date format", error: dateError.message });
    }

    //validate screening questions
    if (!Array.isArray(screening)) {
      return res.status(400).json({
        message: "Screening must be an array",
        received: typeof screening,
      });
    }

    if (screening.length < 1) {
      return res.status(400).json({ message: "Screening answers required" });
    }

    // Validate the structure of each screening item
    for (const item of screening) {
      if (!item.question || typeof item.answer !== "boolean") {
        return res.status(400).json({
          message:
            "Invalid screening format. Each item must have a question (string) and answer (boolean)",
          item,
        });
      }
    }

    if (confirmation !== true) {
      return res.status(400).json({
        message: "You must valid your information",
      });
    }

    const reg = await DonationRegistration.create({
      userId,
      bloodGroup,
      component,
      readyDate,
      screening,
      confirmation,
    });
    return res.status(201).json(reg);
  } catch (err) {
    console.error("Error creating donation registration:", err);
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
};

//view donation(member)
exports.listMine = async (req, res) => {
  try {
    const userId = req.user._id;
    // Đảm bảo trả về tất cả trường dữ liệu khi gọi API
    const regs = await DonationRegistration.find({ userId }).sort("-readyDate");

    console.log(`Đã tìm thấy ${regs.length} đơn đăng ký của user ${userId}`);

    // Log dữ liệu screening để kiểm tra
    regs.forEach((reg, idx) => {
      console.log(
        `Registration #${idx + 1} - ID: ${reg._id}, Status: ${
          reg.status
        }, Has screening: ${
          reg.screening ? reg.screening.length + " items" : "No screening"
        }`
      );
    });

    return res.json(regs);
  } catch (err) {
    console.error("Error in listMine:", err);
    return res.status(500).json({ error: err.message });
  }
};

//view all donation (staff)
exports.listAll = async (req, res) => {
  try {
    // Trả về tất cả thông tin và populate user
    const regs = await DonationRegistration.find()
      .populate("userId", "name email dateOfBirth gender phoneNumber")
      .sort("-createdAt");

    console.log(`Đã tìm thấy ${regs.length} đơn đăng ký tổng cộng`);

    // Log dữ liệu screening để kiểm tra
    regs.forEach((reg, idx) => {
      console.log(
        `Registration #${idx + 1} - ID: ${reg._id}, Status: ${
          reg.status
        }, User: ${reg.userId?.name || "Unknown"}, Has screening: ${
          reg.screening ? reg.screening.length + " items" : "No screening"
        }`
      );
    });

    return res.json(regs);
  } catch (err) {
    console.error("Error in listAll:", err);
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
    const { status, rejectionReason, nextReadyDate } = req.body;

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
      if (nextReadyDate) {
        reg.nextReadyDate = new Date(nextReadyDate);
      } else {
        reg.nextReadyDate = undefined;
      }
      reg.rejectionReason = rejectionReason;
    } else {
      reg.rejectionReason = "";
      reg.nextReadyDate = undefined;
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
    const { quantity, healthCheck } = req.body;
    const reg = await DonationRegistration.findById(id).populate(
      "userId",
      "name email"
    );
    if (!reg || reg.status !== "Approved")
      return res.status(400).json({ message: "Must be approved first" });

    // Validate healthCheck
    if (!healthCheck) {
      return res.status(400).json({ message: "Need health check" });
    }
    const donationDate = new Date();
    const qty = quantity || 1;
    const nextEligibleDate = calNextEligible(reg.component, donationDate);

    await DonationHistory.create({
      userId: reg.userId,
      donationDate,
      bloodGroup: reg.bloodGroup,
      component: reg.component,
      quantity: qty,
      healthCheck,
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
      message: emailSent
        ? "Donation completed. A email has been sent to member"
        : "Donation completed. However, the email could not be sent",
      nextEligibleDate: nextEligibleDate,
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
  else if (component === "Platelets") day = 14;
  const d = new Date(fromDate);
  d.setDate(d.getDate() + day);
  return d;
}

function setToStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isEligibleToDonateBlood(dob, minAge = 18, maxAge = 60) {
  // dob: string, dạng 'YYYY-MM-DD'
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= minAge && age <= maxAge;
}
