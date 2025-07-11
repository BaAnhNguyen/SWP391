const { model, Schema, Types } = require("mongoose");

const blogSchema = new Schema(
  {
    title: {
      type: String,
      require: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: { type: Types.ObjectId, ref: "User", require: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = model("Blog", blogSchema);
