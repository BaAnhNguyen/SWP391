const router = require("express").Router();
const ctrl = require("../controllers/donationMatchController");
const { protect, restrictTo } = require("../middlewares/auth");

router.get("/confirm/:matchId", ctrl.confirmMatch);

router.use(protect);

//gui mail moi hien mau
router.post("/invite", restrictTo("Staff"), ctrl.inviteDonor);

//confirm hien mau

module.exports = router;
