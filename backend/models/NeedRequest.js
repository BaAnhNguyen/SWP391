const {
  Schema,
  model,
  Types,
  trusted,
  default: mongoose,
} = require("mongoose");

const needRequestSchema = new Schema(
  {
    createdBy: {
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
    units: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "Fulfilled",
        "Rejected",
        "Expired",
        "Canceled",
        "Completed",
      ],
      default: "Pending",
    },
    attachment: {
      type: String, // Lưu URL của file ảnh trên server/cloud
      required: false,
    },
    appointmentDate: { type: Date },
    fulfilledAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = model("NeedRequest", needRequestSchema);
