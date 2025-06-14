const router = require("express").Router();
const { model } = require("mongoose");
const ctrl = require("../controllers/needRequestController");
const { protect, restrictTo } = require("../middlewares/auth");

router.use(protect);

//list all need requests (staff only)
router.get("/all", restrictTo("Staff"), ctrl.listAll);

//list user's own requests
router.get("/my", ctrl.listUserRequests);

// Default route should redirect to the appropriate endpoint based on role
router.get("/", (req, res) => {
  if (req.user.role === "Staff" || req.user.role === "Admin") {
    return ctrl.listAll(req, res);
  } else {
    return ctrl.listUserRequests(req, res);
  }
});

//create new need request
router.post("/",restrictTo("Member"), ctrl.create);

//update need request status (staff and admin)
router.patch("/:id/status", restrictTo("Staff", "Admin"), ctrl.updateStatus);

//update need request details (staff, admin and member)
router.patch("/:id", restrictTo("Staff","Member"), ctrl.update);

//delete need request (staff, admin and member)
router.delete("/:id", restrictTo("Staff","Member"), ctrl.delete);

module.exports = router;
