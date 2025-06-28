const mongoose = require("mongoose");

const bloodUnitSchema = new mongoose.Schema({
  BloodType: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  ComponentType: {
    type: String,
    required: true,
    enum: ["WholeBlood", "Plasma", "Platelets", "RedCells"],
  },
  Quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  Volume: {
    type: Number, // in mL
    required: true,
    min: 1,
  },
  DateAdded: {
    type: Date,
    required: true,
    default: Date.now,
  },
  DateExpired: {
    type: Date,
    required: true,
  },
  SourceType: {
    //donation, import
    type: String,
    enum: ["donation", "import"],
    required: true,
    default: "donation",
  },
  SourceRef: {
    //ref toi DonationHistory neu hien mau
    type: mongoose.Schema.Types.ObjectId,
    ref: "DonationHistory",
  },
  note: { type: String },
});

module.exports = mongoose.model("BloodUnit", bloodUnitSchema);
