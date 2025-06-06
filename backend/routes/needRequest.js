const router = require("express").Router();
const { model } = require("mongoose");
const ctrl = require("../controllers/needRequestController");
const { protect, restrictTo } = require("../middlewares/auth");

router.use(protect);

//list (all)
router.get("/", ctrl.listAll);

//create
router.post("/", ctrl.create);

//update status (staff/admin)
router.patch("/:id/status", restrictTo("Staff", "Admin"), ctrl.updateStatus);

//update (all)
router.patch("/:id", ctrl.update);

//delelte (all)
router.delete("/:id", ctrl.delete);

module.exports = router;
