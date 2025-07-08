const NeedRequest = require("../models/NeedRequest");
const BloodUnit = require("../models/BloodUnit");
const { getCompatibleBloodTypes } = require("../utils/bloodCompatibility");

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

    // Only allow delete if status is Pending for Member
    if (req.user.role === "Member") {
      if (nr.status !== "Pending") {
        return res
          .status(400)
          .json({ message: "Cannot delete: status not pending" });
      }
    }

    await NeedRequest.findByIdAndDelete(id);
    return res.json({ message: "Need request deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Assign blood units to a request
exports.assignBloodUnitToRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    // Find the need request
    const needRequest = await NeedRequest.findById(requestId);

    if (!needRequest) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    if (needRequest.status !== "Open" && needRequest.status !== "Pending") {
      return res.status(400).json({
        message: "Can only assign blood units to open or pending requests",
      });
    }

    // Find compatible blood units
    const bloodType = needRequest.bloodGroup;
    const componentType = needRequest.component;

    // Get compatible blood types for the given blood type
    const compatibleBloodTypes = getCompatibleBloodTypes(bloodType);

    // Find compatible blood units that are not already assigned
    const availableBloodUnits = await BloodUnit.find({
      BloodType: { $in: compatibleBloodTypes },
      ComponentType: componentType,
      assignedToRequestId: null,
    }).limit(needRequest.units);

    if (availableBloodUnits.length === 0) {
      return res
        .status(404)
        .json({ message: "No compatible blood units available" });
    }

    if (availableBloodUnits.length < needRequest.units) {
      return res.status(400).json({
        message: `Only ${availableBloodUnits.length} compatible blood units available, but ${needRequest.units} needed`,
      });
    }

    // Assign blood units to the request
    for (const unit of availableBloodUnits) {
      unit.assignedToRequestId = requestId;
      await unit.save();
    }

    // Update request status to "Assigned"
    needRequest.status = "Assigned";
    await needRequest.save();

    return res.status(200).json({
      message: "Blood units assigned successfully",
      assignedUnits: availableBloodUnits.length,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Fulfill a blood request and remove assigned blood units from storage
exports.fulfillBloodRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await BloodRequest.findByIdAndUpdate(
      requestId,
      { status: "Fulfilled" },
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
