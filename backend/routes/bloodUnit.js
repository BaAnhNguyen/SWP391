const router = require("express").Router();
const bloodUnitController = require("../controllers/bloodUnitController");
const { protect, restrictTo } = require("../middlewares/auth");

// All routes require authentication
router.use(protect);

// Add a new blood unit (Staff or Admin only)
router.post("/", restrictTo("Staff", "Admin"), bloodUnitController.addBloodUnit);

// Get all blood unit in the blood bank (Staff or Admin only)
router.get("/", restrictTo("Staff", "Admin"), bloodUnitController.getAllBloodUnits);

// You can add more routes here (e.g., get, update, delete blood units)

module.exports = router;
