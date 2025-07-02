const router = require("express").Router();
const { protect, restrictTo } = require("../middlewares/auth");
const ctrl = require("../controllers/blogController");

// Route public (ai cũng xem được)
router.get("/", ctrl.getBlog);

// Route tĩnh cần đăng nhập/phân quyền, ĐẶT TRƯỚC route động!
router.get("/mine", protect, restrictTo("Admin", "Member"), ctrl.getMine);
router.post("/", protect, restrictTo("Admin", "Member"), ctrl.create);
router.put("/:id/approved", protect, restrictTo("Admin"), ctrl.approve);
router.put("/:id/rejected", protect, restrictTo("Admin"), ctrl.reject);
router.put("/:id", protect, restrictTo("Admin", "Member"), ctrl.update);
router.delete("/:id", protect, restrictTo("Admin", "Member"), ctrl.delete);
router.get("/pending", protect, restrictTo("Admin"), ctrl.getPending);

// Route động, đặt cuối cùng!
router.get("/:id", ctrl.getBlogById);

module.exports = router;
