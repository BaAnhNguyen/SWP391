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
    images: {
      type: [
        {
          url: String,
          public_id: String,
          description: String,
        },
      ],
      validate: {
        validator: function (v) {
          return v.length <= 1;
        },
        message: "Chỉ được upload tối đa 1 ảnh!",
      },
    },
  },
  { timestamps: true }
);

module.exports = model("Blog", blogSchema);
