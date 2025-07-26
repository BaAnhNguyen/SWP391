const mongoose = require("mongoose");

const systemConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
});

module.exports = mongoose.model("SystemConfig", systemConfigSchema);
