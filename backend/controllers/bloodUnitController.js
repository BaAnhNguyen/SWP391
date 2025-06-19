const BloodUnit = require("../models/BloodUnit");

// Add a new blood unit to the inventory
exports.addBloodUnit = async (req, res) => {
  try {
    const { BloodType, ComponentType, Volume, DateAdded } = req.body;
    if (!BloodType || !ComponentType || !Volume) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const dateAdded = DateAdded ? new Date(DateAdded) : new Date();
    let dateExpired;
    switch (ComponentType) {
      case "WholeBlood":
      case "RedCells":
        dateExpired = new Date(dateAdded.getDate() + 35);
        break;
      case "Plasma":
        dateExpired = new Date(dateAdded.getDate() + 365);
        break;
      case "Platelets":
        dateExpired = new Date(dateAdded.getDate() + 5);
        break;
      default:
        return res.status(400).json({ message: "Invalid ComponentType." });
    }
    const bloodUnit = new BloodUnit({
      BloodType,
      ComponentType,
      Volume,
      DateAdded: dateAdded,
      DateExpired: dateExpired
    });
    await bloodUnit.save();
    res.status(201).json(bloodUnit);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to add blood unit." });
  }
};

// Get all blood units in the inventory
exports.getAllBloodUnits = async (req, res) => {
  try {
    const bloodUnits = await BloodUnit.find();
    res.status(200).json(bloodUnits);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch blood units." });
  }
};

// Update a blood unit by ID
exports.updateBloodUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updated = await BloodUnit.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Blood unit not found." });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update blood unit." });
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
    res.status(500).json({ message: err.message || "Failed to delete blood unit." });
  }
};

// Get blood units by blood type
exports.getBloodUnitsByType = async (req, res) => {
  try {
    const { bloodType } = req.params;
    const bloodUnits = await BloodUnit.find({ BloodType: bloodType });
    res.status(200).json(bloodUnits);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch blood units by type." });
  }
};


