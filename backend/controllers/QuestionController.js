// Controller câu hỏi khám sức khỏe - CRUD câu hỏi screening
const Question = require("../models/Question");

// Xem danh sách câu hỏi (đang active)
exports.list = async (req, res) => {
  const questions = await Question.find().sort("order");
  res.json(questions);
};

// Staff thêm câu hỏi mới
exports.create = async (req, res) => {
  const { content, order } = req.body;
  const q = await Question.create({ content, order });
  res.status(201).json(q);
};

// Staff sửa câu hỏi
exports.update = async (req, res) => {
  const { id } = req.params;
  const { content, order, isActive } = req.body;
  const q = await Question.findByIdAndUpdate(
    id,
    { content, order, isActive },
    { new: true }
  );
  if (!q) return res.status(404).json({ message: "Not found" });
  res.json(q);
};

// Staff xóa câu hỏi
exports.delete = async (req, res) => {
  const { id } = req.params;
  const q = await Question.findByIdAndDelete(id);
  if (!q) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Question deleted" });
};
