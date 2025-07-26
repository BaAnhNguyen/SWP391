const DonationRegistration = require("../models/DonationRegistration");
const User = require("../models/User");
const DonationHistory = require("../models/DonationHistory");
const { sendMail } = require("../service/emailService");
const BloodUnit = require("../models/BloodUnit");

//member create donation
exports.create = async (req, res) => {
  try {
    const { bloodGroup, component, readyDate, screening, confirmation } =
      req.body;
    const userId = req.user._id;

    //check bloodGroup in profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra ngày đủ điều kiện hiến máu tiếp theo
    const lastHistory = await DonationHistory.findOne({ userId: userId }).sort({
      donationDate: -1,
    });
    if (lastHistory && lastHistory.nextEligibleDate) {
      const today = setToStartOfDay(new Date());
      const eligible = setToStartOfDay(new Date(lastHistory.nextEligibleDate));
      if (today < eligible) {
        return res.status(400).json({
          message: `Bạn chỉ có thể đăng ký hiến máu sau ngày ${eligible.toLocaleDateString(
            "vi-VN"
          )}`,
          nextEligibleDate: eligible,
        });
      }
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
      bloodGroup: bloodGroup,
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
//update (reject/ approved)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const reg = await DonationRegistration.findById(id);
    if (!reg)
      return res.status(404).json({ message: "Registration not found" });

    // Chỉ cho phép chuyển sang Approved hoặc Rejected
    if (!["Approved", "Rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Only approve or reject allowed." });
    }

    // Nếu rejected phải có lý do
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

exports.complete = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      healthCheckStatus,
      quantity,
      volume,
      healthCheck,
      confirmedBloodGroup,
      confirmedComponent,
    } = req.body;

    // Lấy đơn đăng ký & user song song
    const reg = await DonationRegistration.findById(id);
    if (!reg) {
      return res.status(404).json({ message: "Registration not found" });
    }

    if (reg.status !== "Approved") {
      return res.status(400).json({ message: "Must be approved first" });
    }
    if (!healthCheckStatus || healthCheckStatus !== "completed") {
      return res.status(400).json({
        message: "Health check status is required and must be 'completed'",
      });
    }

    // Lấy user (dùng nhiều lần phía dưới)
    let user = await User.findById(reg.userId);

    // Populate để gửi mail (nếu cần)
    try {
      await reg.populate("userId", "name email");
    } catch (err) {
      // Không ảnh hưởng flow
    }

    const donationDate = new Date();
    const nextEligibleDate = calNextEligible(reg.component, donationDate);

    // Validate input
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1)
      return res.status(400).json({ message: "Valid quantity is required" });

    let vol = parseInt(volume);
    if (isNaN(vol) || vol < 50) vol = qty * 350;

    if (
      !confirmedBloodGroup ||
      confirmedBloodGroup === "unknown" ||
      !confirmedComponent ||
      confirmedComponent === "unknown"
    ) {
      return res.status(400).json({
        message: "Must enter blood group and component in case unknown",
      });
    }

    // Gom các thay đổi để chỉ gọi reg.save() 1 lần
    let regChanged = false;
    if (confirmedBloodGroup && confirmedBloodGroup !== reg.bloodGroup) {
      reg.bloodGroup = confirmedBloodGroup;
      regChanged = true;
      if (user && user.bloodGroup !== confirmedBloodGroup) {
        user.bloodGroup = confirmedBloodGroup;
        await user.save();
      }
    }
    if (confirmedComponent && confirmedComponent !== reg.component) {
      reg.component = confirmedComponent;
      regChanged = true;
    }

    const donationHistoryData = {
      userId: reg.userId,
      donationDate,
      bloodGroup: confirmedBloodGroup || reg.bloodGroup,
      component: confirmedComponent || reg.component,
      status: "Completed",
      quantity: qty,
      volume: vol,
      healthCheck: healthCheck || {},
      nextEligibleDate,
    };

    // Tạo lịch sử hiến máu
    let donationHistory;
    try {
      donationHistory = await DonationHistory.create(donationHistoryData);
    } catch (err) {
      return res.status(500).json({
        message: "Error creating donation history",
        error: err.message,
      });
    }

    // Update registration status và các trường liên quan trong 1 lần save duy nhất
    reg.status = "Completed";
    reg.historyId = donationHistory._id;
    reg.completedAt = donationDate;
    if (req.user && req.user._id) reg.completedBy = req.user._id;
    regChanged = true;

    if (regChanged) {
      try {
        await reg.save();
      } catch (err) {
        return res.status(500).json({
          message: "Error updating registration",
          error: err.message,
        });
      }
    }

    // Tạo BloodUnit, mỗi đơn vị 1 record riêng
    try {
      const dateAdded = new Date();
      let dateExpired = new Date(dateAdded);
      switch (donationHistoryData.component) {
        case "WholeBlood":
        case "RedCells":
          dateExpired.setDate(dateExpired.getDate() + 35);
          break;
        case "Plasma":
          dateExpired.setDate(dateExpired.getDate() + 365);
          break;
        case "Platelets":
          dateExpired.setDate(dateExpired.getDate() + 5);
          break;
      }
      const bloodUnits = [];
      for (let i = 0; i < qty; i++) {
        bloodUnits.push({
          BloodType: donationHistoryData.bloodGroup,
          ComponentType: donationHistoryData.component,
          Quantity: 1,
          Volume: vol,
          DateAdded: dateAdded,
          DateExpired: dateExpired,
          SourceType: "donation",
          SourceRef: donationHistory._id,
          donorName: user?.name,
          donorId: user?._id,
        });
      }
      await BloodUnit.insertMany(bloodUnits);
    } catch (err) {
      // Không cản trở flow, chỉ log
      console.error("Error when add blood to inventory", err);
    }

    // Gửi mail như cũ (có await, client sẽ đợi gửi mail xong)
    let emailSent = false;
    try {
      if (reg.userId && reg.userId.email) {
        await sendMail(reg.userId.email, reg.userId.name, nextEligibleDate);
        emailSent = true;
      }
    } catch (emailError) {
      // Không chặn flow, chỉ log
    }

    return res.json({
      message: emailSent
        ? "Donation completed. An email has been sent to member"
        : "Donation completed. However, the email could not be sent",
      nextEligibleDate,
      donationHistoryId: donationHistory._id,
    });
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

exports.failedHealthCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const { healthCheckStatus, healthCheck, reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ message: "Rejection reason is required." });
    }

    if (!healthCheckStatus || healthCheckStatus !== "rejected") {
      return res.status(400).json({
        message: "Health check status must be 'rejected'.",
      });
    }

    const reg = await DonationRegistration.findById(id).populate("userId");
    if (!reg) {
      return res
        .status(404)
        .json({ message: "Donation registration not found." });
    }

    if (reg.status !== "Approved") {
      return res
        .status(400)
        .json({ message: "Registration must be approved first." });
    }

    // Tạo lịch sử
    const donationHistory = await DonationHistory.create({
      userId: reg.userId._id,
      donationDate: new Date(),
      bloodGroup: reg.bloodGroup,
      component: reg.component,
      status: "Failed",
      quantity: 0,
      volume: 0,
      healthCheck: healthCheck || {},
      nextEligibleDate: null,
    });

    reg.status = "Failed";
    reg.rejectionReason = reason;
    reg.healthCheck = healthCheck || {};
    reg.historyId = donationHistory._id;
    reg.completedAt = new Date();
    if (req.user && req.user._id) reg.completedBy = req.user._id;
    await reg.save();

    return res.status(200).json({
      message: "Donation failed after failed health check.",
      donationHistoryId: donationHistory._id,
    });
  } catch (err) {
    console.error("Error rejecting after health check:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

//helper": calculate next eligible date
function calNextEligible(component, fromDate) {
  let day;
  switch (component) {
    case "Plasma":
      day = 14; //2
      break;
    case "Platelets":
      day = 14; //2
      break;
    case "RedCells":
      day = 112; // 16 weeks for double red cells
      break;
    case "WholeBlood":
      day = 56; // 8 weeks for whole blood
      break;
    default:
      day = 56;
  }
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
