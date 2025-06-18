const { Schema, model } = require("mongoose");

const screeningQuestionSchema = new Schema({
  content: { type: String, required: true },
  order: { type: Number, default: 0 },
});

module.exports = model("Question", screeningQuestionSchema);
