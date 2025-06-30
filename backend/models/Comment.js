const { Schema, model, Types } = require("mongoose");

const commentSchema = new Schema(
  {
    post: {
      type: Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    author: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    parent: { type: Types.ObjectId, ref: "Comment", default: null },
  },
  { timestamps: true }
);

module.exports = model("Comment", commentSchema);
