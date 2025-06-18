const mongoose = require("mongoose");

const bloodUnitSchema = new mongoose.Schema({
  BloodType: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  },
  ComponentType: {
    type: String,
    required: true,
    enum: ["WholeBlood", "Plasma", "Platelets", "RedCells"]
  },
  Volume: {
    type: Number, // in mL
    required: true,
    min: 1
  },
  DateAdded: {
    type: Date,
    required: true,
    default: Date.now
  },
  DateExpired: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model("BloodUnit", bloodUnitSchema);
