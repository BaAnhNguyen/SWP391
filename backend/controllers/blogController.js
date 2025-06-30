const Blog = require("../models/Blog");

//create blog(admin: approved, member : pending)
exports.create = async (req, res) => {
  try {
    const { title, content } = req.body;
    let status = "Pending";
    if (req.user.role === "Admin") status === "Approved";
    const post = await Blog.create({
      title,
      content,
      author: req.user._id,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//list my blog
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

//list blog when approved at homepage
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

//admin watch blog (pending)
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

//admin approved
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

//admin deny
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

//update blog (member before approved)
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
          .josn({ message: "Can not update when approved" });
      }
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

//delete
exports.delete = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found blog" });

    //member
    if (req.user.role === "Member") {
      if (String(post.author) !== String(req.user._id))
        return res.status(403).json({ message: "Do not have permission" });
      if (post.status !== "Pending")
        return res
          .status(400)
          .json({ message: "Can not update when approved" });
    }
    await post.deleteOne;
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
