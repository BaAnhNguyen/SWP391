const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["Guest", "Member", "Staff", "Admin"],
      default: "Member",
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "unknown"],
      default: "unknown",
    },
    identityCard: { type: String },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    address: { type: String }, // <-- string địa chỉ đầy đủ (dễ dùng với Mapbox/Google)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
      },
    },
  },
  { timestamps: true }
);
//geo querry
userSchema.index({ location: "2dsphere" });

module.exports = model("User", userSchema);
