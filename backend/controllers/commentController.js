// Controller quản lý comment - tạo, sửa, xóa comment/reply
const Comment = require("../models/Comment");

// Tạo comment hoặc reply comment
exports.createComment = async (req, res) => {
  try {
    const { postId, content, parent } = req.body;
    // parent: optional
    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content,
      parent: parent || null,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả comment cho 1 bài viết
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "name role _id")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Sửa comment (chỉ tác giả hoặc admin)
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment)
      return res.status(404).json({ message: "Không tìm thấy comment" });

    if (
      String(comment.author) !== String(req.user._id) &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({ message: "Không có quyền sửa comment" });
    }

    comment.content = content ?? comment.content;
    comment.updatedAt = new Date();
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa comment (chỉ tác giả hoặc admin)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment)
      return res.status(404).json({ message: "Không tìm thấy comment" });

    if (
      String(comment.author) !== String(req.user._id) &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({ message: "Không có quyền xóa comment" });
    }

    // Xóa luôn các reply (nếu có)
    await Comment.deleteMany({ parent: comment._id });
    await comment.deleteOne();
    res.json({ message: "Đã xóa comment (và reply nếu có)" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
