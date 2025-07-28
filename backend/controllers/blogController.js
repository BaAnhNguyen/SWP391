// Controller quản lý blog - tạo, sửa, xóa, duyệt bài viết
const Blog = require("../models/Blog");
const cloudinary = require("cloudinary").v2;

// Tạo blog mới (admin: approved, member: pending)
exports.create = async (req, res) => {
  try {
    const { title, content } = req.body;
    let status = "Pending";
    if (req.user.role === "Admin") status = "Approved";

    // Kiểm tra số lượng ảnh tối đa
    if (req.files && req.files.length > 1) {
      return res.status(400).json({
        error: "Chỉ được upload tối đa 1 ảnh!",
      });
    }

    // Xử lý ảnh upload
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
        description: file.originalname,
      }));
    }

    const post = await Blog.create({
      title,
      content,
      author: req.user._id,
      status,
      images,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy danh sách blog của tôi
exports.getMine = async (req, res) => {
  try {
    const posts = await Blog.find({ author: req.user._id }).sort({
      timestamp: -1,
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách blog đã được duyệt hiển thị trang chủ
exports.getBlog = async (req, res) => {
  try {
    const posts = await Blog.find({ status: "Approved" })
      .populate("author", "name role")
      .sort({ timestamp: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin xem blog chờ duyệt (pending)
exports.getPending = async (req, res) => {
  try {
    const posts = await Blog.find({ status: "Pending" })
      .populate("author", "name email")
      .sort({ timestamp: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).jsonn({ error: err.message });
  }
};

// Admin duyệt blog
exports.approve = async (req, res) => {
  try {
    const post = await Blog.findByIdAndUpdate(req.params.id, {
      status: "Approved",
    });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin từ chối blog
exports.reject = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const post = await Blog.findByIdAndUpdate(req.params.id, {
      status: "Rejected",
      adminNote,
    });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật blog (member trước khi được duyệt)
exports.update = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(401).json({ message: "Not found blog" });

    //member
    if (req.user.role === "Member") {
      if (String(post.author) !== String(req.user._id))
        return res.status(403).json({ message: "Do not have permission" });
      if (post.status !== "Pending") {
        return res
          .status(400)
          .json({ message: "Can not update when approved" });
      }
    }

    // Kiểm tra số lượng ảnh tối đa
    if (req.files && req.files.length > 1) {
      return res.status(400).json({
        error: "Chỉ được upload tối đa 1 ảnh!",
      });
    }

    // Xử lý ảnh mới nếu có
    if (req.files && req.files.length > 0) {
      // Xóa ảnh cũ trên Cloudinary
      if (post.images && post.images.length > 0) {
        for (const image of post.images) {
          if (image.public_id) {
            await cloudinary.uploader.destroy(image.public_id);
          }
        }
      }

      // Thêm ảnh mới
      post.images = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
        description: file.originalname,
      }));
    }

    post.title = title ?? post.title;
    post.content = content ?? post.content;
    post.timestamp = Date.now();
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa blog
exports.delete = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found blog" });

    //member
    if (req.user.role === "Member") {
      if (String(post.author) !== String(req.user._id))
        return res.status(403).json({ message: "Do not have permission" });
    }

    // Xóa ảnh trên Cloudinary trước khi xóa blog
    if (post.images && post.images.length > 0) {
      for (const image of post.images) {
        if (image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }
    }

    await post.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy chi tiết 1 blog theo ID
exports.getBlogById = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id).populate(
      "author",
      "name role"
    );
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload ảnh riêng biệt (cho rich text editor)
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const images = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      description: file.originalname,
    }));

    res.json({
      message: "Images uploaded successfully",
      images,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
