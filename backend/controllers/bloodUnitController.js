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
  return compatibility[recipientType] || [];
}

// Get blood units compatible for a request
exports.getBloodUnitsForRequest = async (req, res) => {
  try {
    const { componentType, bloodType } = req.query;
    if (!componentType || !bloodType) {
      return res.status(400).json({ message: "componentType and bloodType are required." });
    }
    // Find compatible blood types for the recipient
    const compatibleTypes = getCompatibleBloodTypes(bloodType);
    if (!compatibleTypes.length) {
      return res.status(400).json({ message: "Invalid or unsupported blood type." });
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