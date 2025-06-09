const { Schema, model, Types } = require("mongoose");
const { Component } = require("react");

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
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      required: true,
    },
    component: {
      type: String,
      enum: ["WholeBlood", "Plasma", "Platelets", "RedCells"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    nextEligibleDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("DonationHistory", donationHistorySchema);
