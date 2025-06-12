const {
  Schema,
  model,
  Types,
  trusted,
  default: mongoose,
} = require("mongoose");

const needRequestSchema = new Schema({
  createdBy: {
    type: Types.ObjectId,
    ref: "User",
    require: true,
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
  units: {
    type: Number,
    require: true,
    min: 1,
  },
  reason: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    enum: ["Open", "Fulfilled", "Expired"],
    default: "Open",
  },
});

module.exports = model("NeedRequest", needRequestSchema);
