const router = require("express").Router();
const { protect, restrictTo } = require("../middlewares/auth");
const ctrl = require("../controllers/donationHistoryController");

router.use(protect);

//Member view
router.get("/me", restrictTo("Member"), ctrl.listMine);

//Staff view
router.get("/", restrictTo("Staff"), ctrl.listAll);

module.exports = router;
