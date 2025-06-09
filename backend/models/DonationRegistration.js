const { Schema, model, Types } = require("mongoose");

const donationSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      required: true,
    },
    component: {
      type: String,
      enum: ["WholeBlood", "Plasma", "Platelets", "RedCells"],
      required: true,
    },
    readyDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed", "Cancelled"],
      default: "Pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    approvedBy: { type: Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    completedBy: { type: Types.ObjectId, ref: "User" },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = model("DonationRegistration", donationSchema);
