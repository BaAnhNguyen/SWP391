const router = require("express").Router();
const ctrl = require("../controllers/userController");
const { protect, restrictTo } = require("../middlewares/auth");

router.use(protect);

//profile
router.get("/me", ctrl.getMe);
router.patch("/me", ctrl.updateMe);

//admin
router.use(restrictTo("Admin"));
router.get("/", ctrl.getAll);
router.patch("/:id/role", ctrl.updateRole);
router.delete("/:id", ctrl.delete);

module.exports = router;
