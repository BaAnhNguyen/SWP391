const router = require("express").Router();
const { protect, restrictTo } = require("../middlewares/auth");
const ctrl = require("../controllers/commentController");

router.get("/:postId", ctrl.getComments);

router.use(protect);

router.use(restrictTo("Admin", "Member"));

router.post("/", ctrl.createComment);
router.put("/:id", ctrl.updateComment);
router.delete("/:id", ctrl.deleteComment);

module.exports = router;
