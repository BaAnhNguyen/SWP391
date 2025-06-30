const NeedRequest = require("../models/NeedRequest");
const BloodUnit = require("../models/BloodUnit");

//create
exports.create = async (req, res) => {
  try {
    const { bloodGroup, component, units, reason } = req.body;
    const createdBy = req.user._id;

    if (units < 1) {
      return res.status(400).json({ message: "Units must be at least 1" });
    }

    const nr = await NeedRequest.create({
      createdBy,
      bloodGroup,
      component,
      units,
      reason,
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
    const allowedStatuses = ["Pending", "Assigned", "Fulfilled", "Rejected", "Expired", "Canceled"];
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
    const allowedBloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
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

// Helper function to get compatible blood types for transfusion
function getCompatibleBloodTypes(recipientType) {
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'],
  };
  return compatibility[recipientType] || [];
}

exports.assignBloodUnitToRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ message: "requestId is required." });
    }

    // Find the request to get the number of units, component, and blood group
    const request = await NeedRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Need request not found." });
    }

    const { units, component, bloodGroup } = request;
    if (!units || !component || !bloodGroup) {
      return res.status(400).json({ message: "Request is missing units, component, or bloodGroup." });
    }

    // Use the same logic as getBloodUnitsForRequest to find compatible blood units
    const compatibleTypes = getCompatibleBloodTypes(bloodGroup);
    if (!compatibleTypes.length) {
      return res.status(400).json({ message: "Invalid or unsupported blood group." });
    }
    const availableUnits = await BloodUnit.find({
      ComponentType: component,
      BloodType: { $in: compatibleTypes },
      assignedToRequestId: null
    }).limit(units);

    if (availableUnits.length < units) {
      return res.status(400).json({ message: `Not enough available blood units. Requested: ${units}, Available: ${availableUnits.length}` });
    }

    // Assign the found blood units to the request
    const updatePromises = availableUnits.map(unit =>
      BloodUnit.findByIdAndUpdate(unit._id, { assignedToRequestId: requestId })
    );
    await Promise.all(updatePromises);

    res.status(200).json({
      message: `${units} blood unit(s) assigned to request.`,
      assignedUnitIds: availableUnits.map(u => u._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error assigning blood units." });
  }
};

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
    const deleteResult = await BloodUnit.deleteMany({ assignedToRequestId: requestId });

    res.status(200).json({
      message: `Request fulfilled and ${deleteResult.deletedCount} blood unit(s) removed from storage.`,
      request
    });
  } catch (error) {
    console.error("Fulfill Error:", error);
    res.status(500).json({ message: "Failed to fulfill request." });
  }
};
