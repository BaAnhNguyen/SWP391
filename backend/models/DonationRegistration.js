const { Schema, model, Types } = require("mongoose");

const screeningQuestionSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: Boolean, required: true },
  },
  { _id: false }
);

const donationSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "unknown"],
      default: "unknown",
    },
    component: {
      type: String,
      enum: ["WholeBlood", "Plasma", "Platelets", "RedCells", "unknown"],
      default: "unknown",
    },
    readyDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed", "Failed"],
      default: "Pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    nextReadyDate: {
      // Ngày được hẹn hiến lại (tuỳ chọn)
      type: Date,
    },
    completedBy: { type: Types.ObjectId, ref: "User" },
    completedAt: { type: Date },

    historyId: {
      type: Types.ObjectId,
      ref: "DonationHistory",
    },
    screening: {
      type: [screeningQuestionSchema],
      default: [],
    },
    confirmation: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

module.exports = model("DonationRegistration", donationSchema);
