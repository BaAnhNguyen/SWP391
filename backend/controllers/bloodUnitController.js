// Controller quản lý kho máu - thêm, cập nhật, xóa, tìm kiếm đơn vị máu
const BloodUnit = require("../models/BloodUnit");
const NeedRequest = require("../models/NeedRequest");
const { getCompatibleBloodTypes } = require("../utils/bloodCompatibility");

// Thêm đơn vị máu mới vào kho
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
    const quantity = Number(Quantity) || 1;
    const volume = Number(Volume);
    const dateAdded = DateAdded ? new Date(DateAdded) : new Date();

    let expireDays = 0;
    switch (ComponentType) {
      case "WholeBlood":
      case "RedCells":
        expireDays = 35;
        break;
      case "Plasma":
        expireDays = 365;
        break;
      case "Platelets":
        expireDays = 5;
        break;
      default:
        return res.status(400).json({ message: "Invalid ComponentType." });
    }

    let bloodUnits = [];
    for (let i = 0; i < quantity; i++) {
      const dateExpired = new Date(dateAdded);
      dateExpired.setDate(dateExpired.getDate() + expireDays);
      bloodUnits.push({
        BloodType,
        ComponentType,
        Volume: volume,
        Quantity: 1,
        SourceType: SourceType || "import",
        note,
        DateAdded: dateAdded,
        DateExpired: dateExpired,
      });
    }

    const result = await BloodUnit.insertMany(bloodUnits);

    res.status(201).json({
      message: `Added ${result.length} blood unit(s) successfully.`,
      bloodUnits: result,
    });
  } catch (err) {
    console.error("addBloodUnit error:", err); // giữ dòng này để debug
    res
      .status(500)
      .json({ message: err.message || "Failed to add blood unit." });
  }
};

// Lấy tất cả đơn vị máu trong kho
exports.getAllBloodUnits = async (req, res) => {
  try {
    const bloodUnits = await BloodUnit.find().populate({
      path: "assignedToRequestId",
      populate: { path: "createdBy", select: "name" },
    });
    res.status(200).json(bloodUnits);
  } catch (err) {
    console.error("getAllBloodUnits error:", err);
    res
      .status(500)
      .json({ message: err.message || "Failed to fetch blood units." });
  }
};

// Cập nhật đơn vị máu theo ID
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

// Get blood units compatible for a request
exports.getBloodUnitsForRequest = async (req, res) => {
  try {
    const { componentType, bloodType } = req.query;
    if (!componentType || !bloodType) {
      return res
        .status(400)
        .json({ message: "componentType and bloodType are required." });
    }

    // Try to normalize the blood type ourselves before passing to getCompatibleBloodTypes
    const normalizedBloodType = bloodType.trim().toUpperCase();
    console.log("Normalized blood type:", normalizedBloodType);

    // Find compatible blood types for the recipient
    console.log(
      "Searching for compatible types for blood type:",
      normalizedBloodType
    );
    const compatibleTypes = getCompatibleBloodTypes(normalizedBloodType);
    console.log("Compatible types found:", compatibleTypes);

    if (!compatibleTypes.length) {
      console.log("No compatible types found for:", normalizedBloodType);
      console.log(
        "Available in compatibility map:",
        Object.keys(require("../utils/bloodCompatibility").compatibility)
      );

      return res.status(400).json({
        message: "Invalid or unsupported blood type.",
        receivedValue: bloodType,
        normalizedValue: normalizedBloodType,
        supportedTypes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      });
    }

    const bloodUnits = await BloodUnit.find({
      ComponentType: componentType,
      BloodType: { $in: compatibleTypes },
      assignedToRequestId: null,
    });

    console.log(
      `Found ${bloodUnits.length} compatible blood units for ${normalizedBloodType}`
    );
    res.status(200).json(bloodUnits);
  } catch (err) {
    console.error("Error in getBloodUnitsForRequest:", err);
    res.status(500).json({
      message: err.message || "Failed to fetch blood units for request.",
    });
  }
};

//create noti on homepage
exports.getCriticalBloodComponents = async (req, res) => {
  try {
    const units = await BloodUnit.find({ DateExpired: { $gt: new Date() } });

    const summary = {};

    units.forEach((unit) => {
      const key = `${unit.BloodType}-${unit.ComponentType}`;
      if (!summary[key]) {
        summary[key] = {
          bloodType: unit.BloodType,
          component: unit.ComponentType,
          totalQuantity: 0,
        };
      }
      summary[key].totalQuantity += unit.Quantity || 1;
    });

    // Chuyển sang danh sách thiếu
    const CRITICAL_THRESHOLD = 10;

    const criticalList = Object.values(summary)
      .filter((item) => item.totalQuantity <= CRITICAL_THRESHOLD)
      .map(({ bloodType, component }) => ({ bloodType, component }));

    return res.json({ critical: criticalList });
  } catch (err) {
    console.error("getCriticalBloodComponents error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
