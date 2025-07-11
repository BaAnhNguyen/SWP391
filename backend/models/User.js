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
    identityCard: {
      type: String,
      required: [true, "Vui lòng nhập số CMND/CCCD"],
      validate: {
        validator: function (v) {
          return /^(?:\d{9}|\d{12}|\d{13})$/.test(v);
        },
        message: "Số CMND/CCCD phải gồm 9, 12 hoặc 13 chữ số",
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      validate: {
        validator: function (v) {
          return /^(0\d{9}|(\+84)\d{9})$/.test(v);
        },
        message:
          "Số điện thoại phải đúng định dạng Việt Nam, gồm 10 số bắt đầu bằng 0 hoặc +84",
      },
    },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    address: { type: String },
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
