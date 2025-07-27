const router = require("express").Router();
const ctrl = require("../controllers/donateRegistrationController");
const { protect, restrictTo } = require("../middlewares/auth");

router.use(protect);

//member routes
router.post("/", ctrl.create); //create new donation registration
router.get("/me", ctrl.listMine); //list user's own donations
router.get("/countToday", ctrl.countToday);
router.get("/nextEligibleDate", restrictTo("Member"), ctrl.getNextEligibleDate);

//staff routes
router.get("/", restrictTo("Staff"), ctrl.listAll); //list all donations
router.patch("/:id/status", restrictTo("Staff"), ctrl.updateStatus); //update donation status
router.post("/:id/complete", restrictTo("Staff"), ctrl.complete);
router.post("/:id/failed", restrictTo("Staff"), ctrl.failedHealthCheck);

//shared routes (staff and member)
router.delete("/:id", restrictTo("Staff", "Member"), ctrl.delete); //delete donation
router.patch("/:id", restrictTo("Staff", "Member"), ctrl.update); //update donation details

module.exports = router;
