const DonationRegistration = require("../models/DonationRegistration");
const User = require("../models/User");
const DonationHistory = require("../models/DonationHistory");
const { sendMail } = require("../service/emailService");
const BloodUnit = require("../models/BloodUnit");

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
    const {
      healthCheckStatus,
      quantity,
      healthCheck,
      cancellationReason,
      followUpDate,
      confirmedBloodGroup,
      confirmedComponent,
    } = req.body;

    // console.log("======== DONATION COMPLETION ========");
    // console.log("Received complete request for ID:", id);
    // console.log("Health check status:", healthCheckStatus);
    // console.log(
    //   "Request user ID:",
    //   req.user ? req.user._id : "No user in request"
    // );
    // console.log("User role:", req.user ? req.user.role : "Unknown");

    const reg = await DonationRegistration.findById(id);
    if (!reg) {
      console.log("Registration not found with ID:", id);
      return res.status(404).json({ message: "Registration not found" });
    }
    const user = await User.findById(reg.userId);

    if (reg.status !== "Approved") {
      console.log("Registration status is not Approved:", reg.status);
      return res.status(400).json({ message: "Must be approved first" });
    }

    if (!healthCheckStatus) {
      console.log("No health check status provided");
      return res
        .status(400)
        .json({ message: "Health check status is required" });
    }

    // Add the user ID information from request or from registration
    const userId = reg.userId;

    try {
      await reg.populate("userId", "name email");
    } catch (populateError) {
      console.error("Error populating user data:", populateError);
      // Continue without populated data if it fails
    }

    const donationDate = new Date();
    const nextEligibleDate = calNextEligible(reg.component, donationDate);

    if (healthCheckStatus === "completed") {
      // Trường hợp hoàn thành hiến máu
      try {
        // Validate quantity
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty < 1) {
          return res
            .status(400)
            .json({ message: "Valid quantity is required" });
        }

        //valid blood group component
        if (
          !confirmedBloodGroup ||
          confirmedBloodGroup === "unknown" ||
          !confirmedComponent ||
          confirmedComponent === "unknown"
        ) {
          return res
            .status(400)
            .json({
              message: "Must enter blood group and compont in case unknown",
            });
        }
        // --- Xử lý cập nhật nhóm máu ---
        if (confirmedBloodGroup && confirmedBloodGroup !== reg.bloodGroup) {
          reg.bloodGroup = confirmedBloodGroup;
          await reg.save();
          if (user && user.bloodGroup !== confirmedBloodGroup) {
            user.bloodGroup = confirmedBloodGroup;
            await user.save();
          }
        }
        // --- Xử lý cập nhật thành phần máu ---
        if (confirmedComponent && confirmedComponent !== reg.component) {
          reg.component = confirmedComponent;
          await reg.save();
        }

        console.log("Creating donation history with userId:", userId);

        // Create donation history - với xử lý an toàn
        const donationHistoryData = {
          userId,
          donationDate,
          bloodGroup: confirmedBloodGroup || reg.bloodGroup,
          component: confirmedComponent || reg.component,
          status: "Completed",
          quantity: qty,
          healthCheck: healthCheck || {},
          nextEligibleDate,
        };

        console.log(
          "Donation history data:",
          JSON.stringify(donationHistoryData)
        );

        let donationHistory;
        try {
          donationHistory = await DonationHistory.create(donationHistoryData);
          console.log("DonationHistory created with ID:", donationHistory._id);
        } catch (historyError) {
          console.error("Error creating donation history:", historyError);
          return res.status(500).json({
            message: "Error creating donation history",
            error: historyError.message,
          });
        }

        // Update registration status
        try {
          reg.status = "Completed";
          reg.historyId = donationHistory._id;
          // Check if req.user exists before assigning completedBy
          if (req.user && req.user._id) {
            reg.completedBy = req.user._id;
            console.log("Setting completedBy to:", req.user._id);
          } else {
            console.log("No user in request, not setting completedBy");
          }
          reg.completedAt = donationDate;
          await reg.save();
          console.log("Registration updated to Completed:", reg._id);
        } catch (regUpdateError) {
          console.error("Error updating registration status:", regUpdateError);
          return res.status(500).json({
            message: "Error updating registration status",
            error: regUpdateError.message,
          });
        }

        // Send email notification
        let emailSent = false;
        try {
          if (reg.userId && reg.userId.email) {
            await sendMail(reg.userId.email, reg.userId.name, nextEligibleDate);
            emailSent = true;
            console.log(`Email sent successfully to ${reg.userId.email}`);
          }
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }

        return res.json({
          message: emailSent
            ? "Donation completed. An email has been sent to member"
            : "Donation completed. However, the email could not be sent",
          nextEligibleDate,
          donationHistoryId: donationHistory._id,
        });
      } catch (error) {
        console.error("Error in complete donation:", error);
        return res.status(500).json({ error: error.message });
      }
    } else if (healthCheckStatus === "canceled") {
      // Trường hợp hủy hiến máu
      try {
        // Validate required fields
        if (!cancellationReason || !cancellationReason.trim()) {
          return res
            .status(400)
            .json({ message: "Cancellation reason is required" });
        }

        if (!followUpDate) {
          return res
            .status(400)
            .json({ message: "Follow-up date is required" });
        }

        const followUpDateObj = new Date(followUpDate);
        if (isNaN(followUpDateObj.getTime())) {
          return res
            .status(400)
            .json({ message: "Invalid follow-up date format" });
        }

        console.log("Creating cancelled donation history with userId:", userId);

        // Create donation history for canceled donation - với xử lý an toàn
        const donationHistoryData = {
          userId,
          donationDate,
          bloodGroup: reg.bloodGroup || "unknown",
          component: reg.component || "unknown",
          status: "Canceled",
          cancellation: {
            reason: cancellationReason,
            followUpDate: followUpDateObj,
          },
          nextEligibleDate: followUpDateObj,
        };

        console.log(
          "Cancelled donation history data:",
          JSON.stringify(donationHistoryData)
        );

        try {
          const donationHistory = await DonationHistory.create(
            donationHistoryData
          );
          console.log(
            "Cancelled DonationHistory created with ID:",
            donationHistory._id
          );
        } catch (historyError) {
          console.error(
            "Error creating cancelled donation history:",
            historyError
          );
          return res.status(500).json({
            message: "Error creating cancelled donation history",
            error: historyError.message,
          });
        }

        // Update registration
        try {
          reg.status = "Cancelled";
          reg.rejectionReason = cancellationReason;
          reg.nextReadyDate = followUpDateObj;
          await reg.save();
          console.log("Registration updated to Cancelled:", reg._id);
        } catch (regUpdateError) {
          console.error(
            "Error updating registration status to Cancelled:",
            regUpdateError
          );
          return res.status(500).json({
            message: "Error updating registration status",
            error: regUpdateError.message,
          });
        }

        return res.json({
          message: "Donation canceled and follow-up appointment scheduled",
          followUpDate: followUpDateObj,
        });
      } catch (error) {
        console.error("Error in cancel donation:", error);
        return res.status(500).json({ error: error.message });
      }
    } else {
      console.log("Invalid health check status:", healthCheckStatus);
      return res.status(400).json({
        message:
          "Invalid health check status. Must be 'completed' or 'canceled'.",
      });
    }
  } catch (err) {
    console.error("Top-level error in complete endpoint:", err);
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
