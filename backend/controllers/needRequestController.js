const NeedRequest = require("../models/NeedRequest");
const BloodUnit = require("../models/BloodUnit");
const { getCompatibleBloodTypes } = require("../utils/bloodCompatibility");
const {
  sendMail,
  getAppointmentMail,
  buildAssignedUnitsTable,
} = require("../service/emailNeedRequest");
const User = require("../models/User");

//create
exports.create = async (req, res) => {
  try {
    const { bloodGroup, component, units, reason } = req.body;
    const createdBy = req.user._id;

    let attachmentURL = null;
    if (req.file) {
      attachmentURL = req.file.path;
    }

    if (units < 1) {
      return res.status(400).json({ message: "Units must be at least 1" });
    }

    const nr = await NeedRequest.create({
      createdBy,
      bloodGroup,
      component,
      units,
      reason,
      attachment: attachmentURL,
    });
    return res.status(200).json(nr);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// list all request (staff only)
exports.listAll = async (req, res) => {
  try {
    const list = await NeedRequest.find()
      .populate("createdBy", "name email")
      .sort("-createdAt");
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// list user's own requests (for members)
exports.listUserRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const list = await NeedRequest.find({ createdBy: userId })
      .populate("createdBy", "name email")
      .sort("-createdAt");
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//update status (staff)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Only allow status values defined in the model
    const allowedStatuses = [
      "Pending",
      "Assigned",
      "Fulfilled",
      "Rejected",
      "Expired",
      "Canceled",
      "Completed",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const nr = await NeedRequest.findById(id);
    if (!nr) {
      return res.status(404).json({ message: "Need request not found" });
    }
    nr.status = status;
    await nr.save();
    return res.json(nr);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//update req
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodGroup, component, units, reason } = req.body;

    const nr = await NeedRequest.findById(id);
    if (!nr) {
      return res.status(404).json({ message: "Need request not found" });
    }

    // Only allow update if status is Pending
    if (req.user.role === "Member") {
      if (nr.status !== "Pending") {
        return res
          .status(400)
          .json({ message: "Cannot update: status not pending" });
      }
    }

    // Validate bloodGroup and component enums
    const allowedBloodGroups = [
      "A+",
      "A-",
      "B+",
      "B-",
      "O+",
      "O-",
      "AB+",
      "AB-",
    ];
    const allowedComponents = ["WholeBlood", "Plasma", "Platelets", "RedCells"];
    if (bloodGroup && !allowedBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({ message: "Invalid blood group" });
    }
    if (component && !allowedComponents.includes(component)) {
      return res.status(400).json({ message: "Invalid component" });
    }

    if (bloodGroup) nr.bloodGroup = bloodGroup;
    if (component) nr.component = component;
    if (units != null) {
      if (units < 1) {
        return res.status(400).json({ message: "Units must be at least 1" });
      }
      nr.units = units;
    }
    if (reason != null) nr.reason = reason;

    await nr.save();
    return res.json(nr);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//delete
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const nr = await NeedRequest.findById(id);
    if (!nr) {
      return res.status(404).json({ message: "Need request not found" });
    }

    // Members can delete if status is Pending, Open or Completed
    if (req.user.role === "Member") {
      if (
        nr.status !== "Pending" &&
        nr.status !== "Open" &&
        nr.status !== "Completed"
      ) {
        return res.status(400).json({
          message:
            "Cannot delete: request is in progress. Status must be Pending, Open, or Completed to delete.",
        });
      }

      // For member, ensure they only delete their own requests
      if (nr.createdBy.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this request" });
      }
    }

    // Staff can delete any request, especially if it's Completed
    await NeedRequest.findByIdAndDelete(id);
    return res.json({ message: "Need request deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Assign specific blood units to a need request
exports.assignSpecificBloodUnits = async (req, res) => {
  try {
    const { requestId, bloodUnitIds, appointmentDate } = req.body;

    // Validate input parameters
    if (
      !requestId ||
      !bloodUnitIds ||
      !Array.isArray(bloodUnitIds) ||
      bloodUnitIds.length === 0
    ) {
      return res.status(400).json({
        message: "Valid requestId and bloodUnitIds array are required.",
      });
    }

    // Find the need request
    const needRequest = await NeedRequest.findById(requestId);

    if (!needRequest) {
      return res.status(404).json({ message: "Blood need request not found" });
    }

    // Verify the request is in a state that can be assigned
    if (needRequest.status !== "Pending") {
      return res.status(400).json({
        message: "Can only assign blood units to pending requests",
      });
    }

    // Verify that enough units are being assigned
    if (bloodUnitIds.length < needRequest.units) {
      return res.status(400).json({
        message: `This request needs ${needRequest.units} units, but only ${bloodUnitIds.length} were selected`,
      });
    }

    // Get compatible blood types for this request
    const compatibleTypes = getCompatibleBloodTypes(needRequest.bloodGroup);

    // Check all blood units
    const selectedUnits = await BloodUnit.find({
      _id: { $in: bloodUnitIds },
    });

    // Verify all units exist
    if (selectedUnits.length !== bloodUnitIds.length) {
      return res.status(400).json({
        message: "One or more selected blood units could not be found",
      });
    }

    // Verify all units are available and compatible
    for (const unit of selectedUnits) {
      // Check if already assigned
      if (unit.assignedToRequestId) {
        return res.status(400).json({
          message: `Blood unit ${unit._id} is already assigned to another request`,
        });
      }

      // Check component type
      if (unit.ComponentType !== needRequest.component) {
        return res.status(400).json({
          message: `Blood unit ${unit._id} has component type ${unit.ComponentType} but request needs ${needRequest.component}`,
        });
      }

      // Check blood type compatibility
      if (!compatibleTypes.includes(unit.BloodType)) {
        return res.status(400).json({
          message: `Blood unit ${unit._id} has blood type ${unit.BloodType} which is not compatible with request blood type ${needRequest.bloodGroup}`,
        });
      }
    }

    // Assign all blood units to the request
    for (const unit of selectedUnits) {
      unit.assignedToRequestId = requestId;
      await unit.save();
    }

    needRequest.assignedTo = needRequest.createdBy;
    // Update request status to "Assigned"
    needRequest.status = "Assigned";
    if (appointmentDate) needRequest.appointmentDate = appointmentDate;
    await needRequest.save();

    //mai
    let emailSent = false;
    try {
      const member = await User.findById(needRequest.createdBy);
      if (member && member.email) {
        const { subject, html } = getAppointmentMail(
          member.name,
          appointmentDate,
          selectedUnits
        );
        await sendMail(member.email, subject, html);
        emailSent = true;
      }
    } catch (err) {}

    console.log(emailSent);
    return res.status(200).json({
      message: emailSent
        ? "Blood units successfully assigned and mail sent to member."
        : "Blood units assigned. But mail could not be sent.",
      assignedUnits: selectedUnits.length,
      requestId: requestId,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to assign blood units to request",
    });
  }
};

// Fulfill a blood request and remove assigned blood units from storage
exports.fulfillBloodRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await NeedRequest.findByIdAndUpdate(
      requestId,
      { status: "Fulfilled", fulfilledAt: new Date() },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    // Remove all blood units assigned to this request
    const deleteResult = await BloodUnit.deleteMany({
      assignedToRequestId: requestId,
    });

    res.status(200).json({
      message: `Request fulfilled and ${deleteResult.deletedCount} blood unit(s) removed from storage.`,
      request,
    });
  } catch (error) {
    console.error("Fulfill Error:", error);
    res.status(500).json({ message: "Failed to fulfill request." });
  }
};

// Reject a blood request with a reason
exports.rejectBloodRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: "Rejection reason is required." });
    }

    const request = await NeedRequest.findByIdAndUpdate(
      requestId,
      { status: "Rejected", rejectionReason: reason },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Need request not found" });
    }

    res.status(200).json({ message: "Request rejected.", request });
  } catch (error) {
    console.error("Reject Error:", error);
    res.status(500).json({ message: "Failed to reject request." });
  }
};

exports.confirm = async (req, res) => {
  try {
    const { requestId } = req.params;
    console.log(`Received complete request for ID: ${requestId}`);
    console.log(`Request params:`, req.params);

    const userId = req.user._id;
    const request = await NeedRequest.findById(requestId);
    if (!request) {
      console.log(`Request with ID ${requestId} not found`);
      return res.status(404).json({ message: "Need request not found" });
    }

    // Member only can confirm when fulfilled
    if (request.createdBy.toString() != userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not the owner of this request" });
    }
    if (request.status !== "Fulfilled") {
      return res
        .status(400)
        .json({ message: "Can only confirm when status is fulfilled" });
    }

    request.status = "Completed";
    request.completedAt = new Date();
    await request.save();

    res.status(200).json({
      message: "Blood request completed successfully",
      request,
    });
  } catch (err) {
    console.error("Error completing request:", err);
    res
      .status(500)
      .json({ message: err.message || "Failed to complete request" });
  }
};
