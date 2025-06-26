const router = require("express").Router();
const { protect, restrictTo } = require("../middlewares/auth");
const ctrl = require("../controllers/donationHistoryController");

router.use(protect);

router.get("/:id", restrictTo("Member", "Staff"), ctrl.getOne);

module.exports = router;
