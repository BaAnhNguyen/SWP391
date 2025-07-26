const router = require("express").Router();
const { protect, restrictTo } = require("../middlewares/auth");
const blogUpload = require("../middlewares/blogUpload");
const ctrl = require("../controllers/blogController");

// Route public (ai cũng xem được)
router.get("/", ctrl.getBlog);

// Route tĩnh cần đăng nhập/phân quyền, ĐẶT TRƯỚC route động!
router.get("/mine", protect, restrictTo("Admin", "Member"), ctrl.getMine);
router.post(
  "/",
  protect,
  restrictTo("Admin", "Member"),
  blogUpload.array("images", 5),
  ctrl.create
);
router.put(
  "/:id/approved",
  protect,
  restrictTo("Admin", "Staff"),
  ctrl.approve
);
router.put("/:id/rejected", protect, restrictTo("Admin", "Staff"), ctrl.reject);
router.put(
  "/:id",
  protect,
  restrictTo("Admin", "Member"),
  blogUpload.array("images", 5),
  ctrl.update
);
router.delete("/:id", protect, restrictTo("Admin", "Member"), ctrl.delete);
router.get("/pending", protect, restrictTo("Admin", "Staff"), ctrl.getPending);

// Route upload ảnh riêng biệt
router.post(
  "/upload-images",
  protect,
  restrictTo("Admin", "Member"),
  blogUpload.array("images", 10),
  ctrl.uploadImages
);

// Route động, đặt cuối cùng!
router.get("/:id", ctrl.getBlogById);

module.exports = router;
