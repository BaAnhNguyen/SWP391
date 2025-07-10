const { Schema, model, Types } = require("mongoose");

const donationMatchSchema = new Schema(
  {
    donor: { type: Types.ObjectId, ref: "User", required: true },
    needRequest: { type: Types.ObjectId, ref: "NeedRequest", required: true },
    appointmentDate: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "Matched", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = model("DonationMatch", donationMatchSchema);
