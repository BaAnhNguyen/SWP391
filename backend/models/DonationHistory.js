const { Schema, model, Types } = require("mongoose");

const healthCheckSchema = new Schema(
  {
    weight: { type: Number },
    height: { type: Number },
    bloodPressure: {
      type: String,
      validate: {
        validator: (v) => !v || /^\d{2,3}\/\d{2,3}$/.test(v),
      },
    },
    heartRate: { type: Number },
    alcoholLevel: { type: Number },
    temperature: { type: Number },
    hemoglobin: { type: Number },
  },
  { _id: false }
);

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
    },
    component: {
      type: String,
      enum: ["WholeBlood", "Plasma", "Platelets", "RedCells", "unknown"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Completed", "Failed"],
      required: true,
      default: "Completed",
    },
    quantity: { type: Number },
    volume: { type: Number },

    healthCheck: healthCheckSchema,

    nextEligibleDate: {
      type: Date,
      required: false, // vì reject thì không cần
    },
  },
  { timestamps: true }
);

module.exports = model("DonationHistory", donationHistorySchema);
