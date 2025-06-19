const router = require("express").Router();
const bloodUnitController = require("../controllers/bloodUnitController");
const { protect, restrictTo } = require("../middlewares/auth");

// All routes require authentication
router.use(protect);

// Add a new blood unit (Staff only)
router.post("/", restrictTo("Staff"), bloodUnitController.addBloodUnit);

// Get all blood unit in the blood bank (Staff only)
router.get("/", restrictTo("Staff"), bloodUnitController.getAllBloodUnits);

// Update a blood unit by ID (Staff only)
router.patch("/:id", restrictTo("Staff"), bloodUnitController.updateBloodUnit);

// Delete a blood unit by ID (Staff only)
router.delete("/:id", restrictTo("Staff"), bloodUnitController.deleteBloodUnit);

// Get blood units by blood type (Staff only)
router.get("/type/:bloodType", restrictTo("Staff"), bloodUnitController.getBloodUnitsByType);

// You can add more routes here (e.g., get, update, delete blood units)

module.exports = router;
