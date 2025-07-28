/**
 * @fileoverview Blood Unit Management Routes for Blood Donation Management System
 * @description Routes xử lý blood inventory management và compatibility checking
 *
 * Chức năng chính:
 * - Blood unit inventory management (CRUD operations)
 * - Blood type compatibility checking và filtering
 * - Critical blood level monitoring cho public alerts
 * - Blood unit assignment cho need requests
 * - Expiration date tracking và management
 *
 * @requires express.Router - Express router instance
 * @requires ../controllers/bloodUnitController - Blood unit management controllers
 * @requires ../middlewares/auth - Authentication và role-based access control
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const router = require("express").Router();
const bloodUnitController = require("../controllers/bloodUnitController");
const { protect, restrictTo } = require("../middlewares/auth");

/**
 * @section Public Blood Information
 * @description Public endpoints cho blood shortage alerts
 */

/**
 * @route GET /api/blood-unit/critical
 * @access Public
 * @description Get critical blood components for homepage alerts
 *
 * Public blood shortage information:
 * - Show blood types với critically low inventory
 * - Display shortage levels (Critical/Low/Adequate)
 * - Include blood component types (Whole Blood, Plasma, Platelets)
 * - Used cho homepage donation encouragement banners
 * - No authentication required để encourage public awareness
 * - Cache results để reduce database load
 */
router.get("/critical", bloodUnitController.getCriticalBloodComponents);

/**
 * @middleware protect
 * @description All inventory management routes require authentication
 *
 * Apply JWT authentication cho blood unit operations:
 * - Verify staff credentials để access inventory
 * - Block banned users từ blood management
 * - Ensure proper audit trail cho all operations
 */
router.use(protect);

/**
 * @section Blood Unit CRUD Operations
 * @description Core inventory management routes (Staff only)
 */

/**
 * @route POST /api/blood-unit/
 * @access Private (Staff only)
 * @description Add new blood unit to inventory
 *
 * Blood unit creation process:
 * - Record blood unit từ completed donation
 * - Set expiration date based on component type
 * - Generate unique unit identifier/barcode
 * - Record donor information và donation date
 * - Initialize unit status as "Available"
 * - Update inventory level statistics
 */
router.post("/", restrictTo("Staff"), bloodUnitController.addBloodUnit);

/**
 * @route GET /api/blood-unit/
 * @access Private (Staff only)
 * @description Get all blood units in blood bank inventory
 *
 * Comprehensive inventory listing:
 * - List all blood units với status và details
 * - Support pagination cho large inventories
 * - Filter by status (Available/Reserved/Expired/Used)
 * - Sort by expiration date, donation date, blood type
 * - Include donor information for traceability
 * - Show compatibility information
 */
router.get("/", restrictTo("Staff"), bloodUnitController.getAllBloodUnits);

/**
 * @route PATCH /api/blood-unit/:id
 * @access Private (Staff only)
 * @description Update blood unit information
 *
 * Blood unit modification:
 * - Update unit status (Available → Reserved → Used)
 * - Modify expiration dates nếu needed
 * - Add testing results hoặc notes
 * - Record quality control information
 * - Track unit movement within facility
 * - Maintain audit trail của all changes
 */
router.patch("/:id", restrictTo("Staff"), bloodUnitController.updateBloodUnit);

/**
 * @route DELETE /api/blood-unit/:id
 * @access Private (Staff only)
 * @description Remove blood unit from inventory
 *
 * Blood unit disposal:
 * - Mark expired units cho disposal
 * - Handle contaminated hoặc compromised units
 * - Record disposal reason và method
 * - Update inventory statistics
 * - Maintain disposal log cho regulatory compliance
 * - Cannot delete units assigned to active requests
 */
router.delete("/:id", restrictTo("Staff"), bloodUnitController.deleteBloodUnit);

/**
 * @section Blood Type Management & Filtering
 * @description Routes cho blood compatibility và type-specific operations
 */

/**
 * @route GET /api/blood-unit/type/:bloodType
 * @access Private (Staff only)
 * @description Get blood units by specific blood type
 *
 * Blood type filtering:
 * - Filter inventory by ABO/Rh blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
 * - Show available units cho specific blood type
 * - Include expiration date sorting
 * - Display unit quantities và component types
 * - Support emergency blood type requests
 * - Used cho targeted donor outreach
 */
router.get(
  "/type/:bloodType",
  restrictTo("Staff"),
  bloodUnitController.getBloodUnitsByType
);

/**
 * @route GET /api/blood-unit/filter/for-request
 * @access Private (Staff only)
 * @description Get compatible blood units for specific need request
 *
 * Request-specific compatibility matching:
 * - Match blood units compatible với patient's blood type
 * - Apply ABO/Rh compatibility rules
 * - Filter by component type needed (Whole Blood, RBC, Plasma, Platelets)
 * - Sort by expiration date (FIFO - First In, First Out)
 * - Show available quantities vs. requested amounts
 * - Reserve units when assigned to requests
 * - Handle emergency compatibility protocols
 *
 * Compatibility Rules:
 * - O- is universal donor for RBC
 * - AB+ is universal recipient for RBC
 * - AB is universal donor for plasma
 * - O is universal recipient for plasma
 * - Platelet compatibility less restrictive
 */
router.get(
  "/filter/for-request",
  restrictTo("Staff"),
  bloodUnitController.getBloodUnitsForRequest
);

/**
 * Export blood unit router
 * @description Router này handle blood inventory management:
 *
 * Inventory Workflow:
 * 1. Blood units created từ successful donations
 * 2. Units stored với proper identification và expiration tracking
 * 3. Regular inventory monitoring cho critical levels
 * 4. Compatibility matching cho need requests
 * 5. Unit assignment và reservation system
 * 6. Expiration management và disposal procedures
 *
 * Blood Compatibility Matrix:
 * - A+ can receive: A+, A-, O+, O-
 * - A- can receive: A-, O-
 * - B+ can receive: B+, B-, O+, O-
 * - B- can receive: B-, O-
 * - AB+ can receive: AB+, AB-, A+, A-, B+, B-, O+, O- (Universal recipient)
 * - AB- can receive: AB-, A-, B-, O-
 * - O+ can receive: O+, O-
 * - O- can receive: O- only
 *
 * Component Types:
 * - Whole Blood: 35-42 days shelf life
 * - Red Blood Cells: 42 days shelf life
 * - Plasma: 1 year frozen, 5 days thawed
 * - Platelets: 5 days shelf life (most critical)
 *
 * Business Rules:
 * - FIFO policy cho expiration management
 * - Critical level alerts khi inventory < 5 units
 * - Reserved units cannot be reassigned without staff approval
 * - Expired units must be disposed properly
 * - All operations logged cho regulatory compliance
 *
 * Integration Points:
 * - Donation completion system
 * - Need request assignment system
 * - Public alert system
 * - Inventory analytics dashboard
 * - Regulatory reporting system
 */
module.exports = router;
