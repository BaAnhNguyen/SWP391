const router = require("express").Router();
const ctrl = require("../controllers/userController");
const search = require("../controllers/searchByDistance");
const { protect, restrictTo } = require("../middlewares/auth");

router.use(protect);

//profile
router.get("/me", ctrl.getMe);
router.patch("/me", ctrl.updateMe);

//emergency alert status - all authenticated users can read
router.get("/emergency-alert", ctrl.getEmergencyAlertStatus);

//search
router.get("/nearby", restrictTo("Staff"), search.searchByDistance);

//admin
router.use(restrictTo("Admin"));
router.get("/", ctrl.getAll);
router.patch("/:id/role", ctrl.updateRole);
router.delete("/:id", ctrl.delete);
router.patch("/ban/:userId", restrictTo("Admin"), ctrl.banUser);
router.patch("/unban/:userId", restrictTo("Admin"), ctrl.unbanUser);
router.patch(
  "/toggle-emergency-alert",
  restrictTo("Admin"),
  ctrl.toggleEmergencyAlert
);

module.exports = router;
