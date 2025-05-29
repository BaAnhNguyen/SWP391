const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["Guest", "Member", "Staff", "Admin"],
      default: "Guest",
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    location: { type: String },
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
