const BloodUnit = require("../models/BloodUnit");

// Add a new blood unit to the inventory
exports.addBloodUnit = async (req, res) => {
  try {
    const {
      BloodType,
      ComponentType,
      Volume,
      Quantity,
      SourceType,
      note,
      DateAdded,
    } = req.body;
    if (!BloodType || !ComponentType || !Volume || !Quantity) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const dateAdded = DateAdded ? new Date(DateAdded) : new Date();
    const dateExpired = new Date(dateAdded);
    switch (ComponentType) {
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
      default:
        return res.status(400).json({ message: "Invalid ComponentType." });
    }
    const bloodUnit = new BloodUnit({
      BloodType,
      ComponentType,
      Volume: Number(Volume),
      Quantity: Number(Quantity) || 1,
      SourceType: SourceType || "import",
      note,
      DateAdded: dateAdded,
      DateExpired: dateExpired,
    });
    await bloodUnit.save();
    res.status(201).json(bloodUnit);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Failed to add blood unit." });
  }
};

// Get all blood units in the inventory
exports.getAllBloodUnits = async (req, res) => {
  try {
    const bloodUnits = await BloodUnit.find();
    res.status(200).json(bloodUnits);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Failed to fetch blood units." });
  }
};

// Update a blood unit by ID
exports.updateBloodUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updated = await BloodUnit.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Blood unit not found." });
    }
    res.status(200).json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Failed to update blood unit." });
  }
};

// Delete a blood unit by ID
exports.deleteBloodUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BloodUnit.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Blood unit not found." });
    }
    res.status(200).json({ message: "Blood unit deleted successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Failed to delete blood unit." });
  }
};

// Get blood units by blood type
exports.getBloodUnitsByType = async (req, res) => {
  try {
    const { bloodType } = req.params;
    const bloodUnits = await BloodUnit.find({ BloodType: bloodType });
    res.status(200).json(bloodUnits);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Failed to fetch blood units by type." });
  }
};

// Helper function to get compatible blood types for transfusion
function getCompatibleBloodTypes(recipientType) {
  // Normalize blood type to handle possible format differences
  const normalizedType = recipientType ? recipientType.toUpperCase().replace(/\s+/g, '') : '';

  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // universal recipient
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'], // universal donor
  };

  // Handle alternative formats that might be used
  if (normalizedType === 'APOSITIVE' || normalizedType === 'A POSITIVE') return compatibility['A+'];
  if (normalizedType === 'ANEGATIVE' || normalizedType === 'A NEGATIVE') return compatibility['A-'];
  if (normalizedType === 'BPOSITIVE' || normalizedType === 'B POSITIVE') return compatibility['B+'];
  if (normalizedType === 'BNEGATIVE' || normalizedType === 'B NEGATIVE') return compatibility['B-'];
  if (normalizedType === 'ABPOSITIVE' || normalizedType === 'AB POSITIVE') return compatibility['AB+'];
  if (normalizedType === 'ABNEGATIVE' || normalizedType === 'AB NEGATIVE') return compatibility['AB-'];
  if (normalizedType === 'OPOSITIVE' || normalizedType === 'O POSITIVE') return compatibility['O+'];
  if (normalizedType === 'ONEGATIVE' || normalizedType === 'O NEGATIVE') return compatibility['O-'];

  return compatibility[normalizedType] || [];
}

// Get blood units compatible for a request
exports.getBloodUnitsForRequest = async (req, res) => {
  try {
    const { componentType, bloodType } = req.query;
    if (!componentType || !bloodType) {
      return res.status(400).json({ message: "componentType and bloodType are required." });
    }
    // Find compatible blood types for the recipient
    console.log("Searching for compatible types for blood type:", bloodType);
    const compatibleTypes = getCompatibleBloodTypes(bloodType);
    if (!compatibleTypes.length) {
      return res.status(400).json({
        message: "Invalid or unsupported blood type.",
        receivedValue: bloodType,
        supportedTypes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
      });
    }
    const bloodUnits = await BloodUnit.find({
      ComponentType: componentType,
      BloodType: { $in: compatibleTypes },
      assignedToRequestId: null
    });
    res.status(200).json(bloodUnits);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch blood units for request." });
  }
};

// Assign specific blood units to a need request
exports.assignSpecificBloodUnits = async (req, res) => {
  try {
    const { requestId, bloodUnitIds } = req.body;

    // Validate input parameters
    if (!requestId || !bloodUnitIds || !Array.isArray(bloodUnitIds) || bloodUnitIds.length === 0) {
      return res.status(400).json({
        message: "Valid requestId and bloodUnitIds array are required."
      });
    }

    // Find the need request
    const NeedRequest = require("../models/NeedRequest");
    const needRequest = await NeedRequest.findById(requestId);

    if (!needRequest) {
      return res.status(404).json({ message: "Blood need request not found" });
    }

    // Verify the request is in a state that can be assigned
    if (needRequest.status !== "Open" && needRequest.status !== "Pending") {
      return res.status(400).json({
        message: "Can only assign blood units to open or pending requests"
      });
    }

    // Verify that enough units are being assigned
    if (bloodUnitIds.length < needRequest.units) {
      return res.status(400).json({
        message: `This request needs ${needRequest.units} units, but only ${bloodUnitIds.length} were selected`
      });
    }

    // Get compatible blood types for this request
    const compatibleTypes = getCompatibleBloodTypes(needRequest.bloodGroup);

    // Check all blood units
    const selectedUnits = await BloodUnit.find({
      _id: { $in: bloodUnitIds }
    });

    // Verify all units exist
    if (selectedUnits.length !== bloodUnitIds.length) {
      return res.status(400).json({
        message: "One or more selected blood units could not be found"
      });
    }

    // Verify all units are available and compatible
    for (const unit of selectedUnits) {
      // Check if already assigned
      if (unit.assignedToRequestId) {
        return res.status(400).json({
          message: `Blood unit ${unit._id} is already assigned to another request`
        });
      }

      // Check component type
      if (unit.ComponentType !== needRequest.component) {
        return res.status(400).json({
          message: `Blood unit ${unit._id} has component type ${unit.ComponentType} but request needs ${needRequest.component}`
        });
      }

      // Check blood type compatibility
      if (!compatibleTypes.includes(unit.BloodType)) {
        return res.status(400).json({
          message: `Blood unit ${unit._id} has blood type ${unit.BloodType} which is not compatible with request blood type ${needRequest.bloodGroup}`
        });
      }
    }

    // Assign all blood units to the request
    for (const unit of selectedUnits) {
      unit.assignedToRequestId = requestId;
      await unit.save();
    }

    // Update request status to "Assigned"
    needRequest.status = "Assigned";
    await needRequest.save();

    return res.status(200).json({
      message: "Blood units successfully assigned to request",
      assignedUnits: selectedUnits.length,
      requestId: requestId
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to assign blood units to request" });
  }
};