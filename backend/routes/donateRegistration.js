const router = require("express").Router();
const ctrl = require("../controllers/donateRegistrationController");
const { protect, restrictTo } = require("../middlewares/auth");

router.use(protect);

//member
router.post("/", ctrl.create);
router.get("/me", ctrl.listMine);

//Staff/admin
router.get("/", restrictTo("Staff", "Admin"), ctrl.listAll);
router.patch("/:id/status", restrictTo("Staff", "Admin"), ctrl.updateStatus);

//all
router.delete("/:id", restrictTo("Member", "Staff", "Admin"), ctrl.delete);
router.patch("/:id", restrictTo("Member", "Staff", "Admin"), ctrl.update);

module.exports = router;
