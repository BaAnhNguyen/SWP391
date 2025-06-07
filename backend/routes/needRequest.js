const router = require("express").Router();
const { model } = require("mongoose");
const ctrl = require("../controllers/needRequestController");
const { protect, restrictTo } = require("../middlewares/auth");

router.use(protect);

//list all need requests
router.get("/", ctrl.listAll);

//create new need request
router.post("/", ctrl.create);

//update need request status (staff only)
router.patch("/:id/status", restrictTo("Staff"), ctrl.updateStatus);

//update need request details (staff and member)
router.patch("/:id", restrictTo("Staff", "Member"), ctrl.update);

//delete need request (staff and member)
router.delete("/:id", restrictTo("Staff", "Member"), ctrl.delete);

module.exports = router;
