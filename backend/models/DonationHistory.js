const { Schema, model, Types } = require("mongoose");

const donationHistorySchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    donationDate: {
      type: Date,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "unknown"],
      required: true,
      default: "unknown",
    },
    component: {
      type: String,
      enum: ["WholeBlood", "Plasma", "Platelets", "RedCells", "unknown"],
      required: true,
      default: "unknown",
    },
    status: {
      type: String,
      enum: ["Completed", "Canceled"],
      required: true,
      default: "Completed",
    },
    quantity: {
      type: Number,
      min: 0, // Thay đổi giá trị tối thiểu thành 0 để cho phép bỏ trống trong trường hợp hủy
    },
    healthCheck: {
      weight: Number,
      height: Number,
      bloodPressure: String, // "120/80"
      heartRate: Number,
      alcoholLevel: Number,
      temperature: Number,
      hemoglobin: Number,
    },
    cancellation: {
      reason: String,
      followUpDate: Date,
    },
    nextEligibleDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("DonationHistory", donationHistorySchema);
