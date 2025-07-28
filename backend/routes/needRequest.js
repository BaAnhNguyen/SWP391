/**
 * @fileoverview Blood Need Request Routes for Blood Donation Management System
 * @description Routes xử lý blood need requests và blood unit assignment
 *
 * Chức năng chính:
 * - Blood need request creation và management
 * - Staff workflow cho request approval/rejection
 * - Blood unit assignment và fulfillment process
 * - Member request tracking và completion
 * - Donor invitation system
 *
 * @requires express.Router - Express router instance
 * @requires ../controllers/needRequestController - Need request management controllers
 * @requires ../middlewares/auth - Authentication và role-based access control
 * @requires ../middlewares/upload - File upload middleware cho attachments
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const router = require("express").Router();
const { model } = require("mongoose");
const ctrl = require("../controllers/needRequestController");
const { protect, restrictTo } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

/**
 * @middleware protect
 * @description Tất cả routes require authentication
 *
 * Apply JWT authentication cho all need request routes:
 * - Verify user token và load user data
 * - Block access cho banned users
 * - Ensure user có proper permissions
 */
router.use(protect);

/**
 * @section Request Listing & Overview
 * @description Routes cho viewing need requests với role-based access
 */

/**
 * @route GET /api/need-request/all
 * @access Private (Staff/Admin only)
 * @description Get all blood need requests for staff management
 *
 * Staff dashboard listing:
 * - View all pending/active need requests
 * - Filter by status, blood group, urgency
 * - Pagination và sorting support
 * - Include request details và contact info
 */
router.get("/all", restrictTo("Staff"), ctrl.listAll);

/**
 * @route GET /api/need-request/my
 * @access Private (All authenticated users)
 * @description Get user's own blood need requests
 *
 * Personal request history:
 * - List user's submitted requests
 * - Show status và progress updates
 * - Include assigned blood units nếu có
 * - Track completion status
 */
router.get("/my", ctrl.listUserRequests);

/**
 * @route GET /api/need-request/
 * @access Private (Role-based redirect)
 * @description Smart routing based on user role
 *
 * Dynamic endpoint behavior:
 * - Staff/Admin: Redirect to all requests (ctrl.listAll)
 * - Member/Guest: Redirect to personal requests (ctrl.listUserRequests)
 * - Provide seamless UX với single endpoint
 */
router.get("/", (req, res) => {
  if (req.user.role === "Staff" || req.user.role === "Admin") {
    return ctrl.listAll(req, res);
  } else {
    return ctrl.listUserRequests(req, res);
  }
});

/**
 * @section Request Creation & Management
 * @description Routes cho creating và updating need requests
 */

/**
 * @route POST /api/need-request/
 * @access Private (Member only)
 * @description Create new blood need request
 *
 * Request submission process:
 * - Upload medical attachment/prescription
 * - Validate blood group và quantity requirements
 * - Set initial status to "Pending"
 * - Send notification đến staff cho review
 * - Rate limiting để prevent spam
 */
router.post(
  "/",
  restrictTo("Member"),
  upload.single("attachment"), // Handle medical document upload
  ctrl.create
);

/**
 * @route PATCH /api/need-request/:id/status
 * @access Private (Staff only)
 * @description Update blood request status
 *
 * Status management workflow:
 * - Approve/reject pending requests
 * - Mark as fulfilled when blood units assigned
 * - Set to completed when patient receives blood
 * - Log status changes với timestamps
 * - Send notifications đến requester
 */
router.patch("/:id/status", restrictTo("Staff"), ctrl.updateStatus);

/**
 * @route PATCH /api/need-request/:id
 * @access Private (Staff/Member only)
 * @description Update need request details
 *
 * Request modification:
 * - Staff: Update any field, change priority, add notes
 * - Member: Update own requests (limited fields)
 * - Validate changes và prevent invalid transitions
 * - Track modification history
 */
router.patch("/:id", restrictTo("Staff", "Member"), ctrl.update);

/**
 * @route DELETE /api/need-request/:id
 * @access Private (Staff/Member only)
 * @description Delete blood need request
 *
 * Request deletion:
 * - Staff: Can delete any request với proper reason
 * - Member: Can only delete own pending requests
 * - Soft delete để preserve audit trail
 * - Handle cleanup của related blood unit assignments
 */
router.delete("/:id", restrictTo("Staff", "Member"), ctrl.delete);

/**
 * @section Blood Unit Assignment & Fulfillment
 * @description Routes cho blood inventory management và assignment
 */

/**
 * @route POST /api/need-request/assign-blood-units
 * @access Private (Staff only)
 * @description Assign available blood units to requests
 *
 * Blood allocation process:
 * - Match blood compatibility rules
 * - Check unit availability và expiration dates
 * - Reserve units cho specific request
 * - Update inventory status
 * - Generate fulfillment notifications
 */
router.post(
  "/assign-blood-units",
  restrictTo("Staff"),
  ctrl.assignSpecificBloodUnits
);

/**
 * @route POST /api/need-request/fulfill/:requestId
 * @access Private (Staff only)
 * @description Mark request as fulfilled với blood units
 *
 * Fulfillment process:
 * - Confirm blood units đã được assigned
 * - Update request status to "Fulfilled"
 * - Generate pickup/delivery instructions
 * - Send completion notification đến requester
 * - Update blood inventory levels
 */
router.post(
  "/fulfill/:requestId",
  restrictTo("Staff"),
  ctrl.fulfillBloodRequest
);

/**
 * @route POST /api/need-request/reject/:requestId
 * @access Private (Staff only)
 * @description Reject blood need request
 *
 * Request rejection workflow:
 * - Provide rejection reason
 * - Release any reserved blood units
 * - Send notification với explanation
 * - Log rejection để track patterns
 * - Allow resubmission với modifications
 */
router.post("/reject/:requestId", restrictTo("Staff"), ctrl.rejectBloodRequest);

/**
 * @route POST /api/need-request/complete/:requestId
 * @access Private (Member only)
 * @description Confirm blood receipt và complete request
 *
 * Completion confirmation:
 * - Patient/family confirms blood received
 * - Mark request as fully completed
 * - Trigger thank you notifications
 * - Update donation impact statistics
 * - Generate completion certificates
 */
router.post(
  "/complete/:requestId",
  (req, res, next) => {
    console.log("Complete route accessed with params:", req.params);
    next();
  },
  restrictTo("Member"),
  ctrl.confirm
);

/**
 * @section Request Analytics & Tracking
 * @description Routes cho request statistics và monitoring
 */

/**
 * @route GET /api/need-request/countToday
 * @access Private (Member only)
 * @description Count user's requests submitted today
 *
 * Daily request limit check:
 * - Prevent spam submissions
 * - Show remaining requests allowed
 * - Rate limiting implementation
 * - Display submission history
 */
router.get("/countToday", restrictTo("Member"), ctrl.countToday);

/**
 * @route GET /api/need-request/:id
 * @access Private (All authenticated users)
 * @description Get specific need request details
 *
 * Request detail view:
 * - Show full request information
 * - Include status history và updates
 * - Display assigned blood units nếu có
 * - Show contact information cho coordination
 * - Privacy controls based on user role
 */
router.get("/:id", ctrl.getNeedRequestById);

/**
 * @section Donor Coordination
 * @description Routes cho donor outreach và scheduling
 */

/**
 * @route POST /api/need-request/invite
 * @access Private (Staff only)
 * @description Send donor invitation for urgent requests
 *
 * Donor invitation system:
 * - Target compatible donors in area
 * - Send urgent request notifications
 * - Include hospital location và contact info
 * - Track invitation responses
 * - Coordinate donation appointments
 */
router.post("/invite", restrictTo("Staff"), ctrl.inviteDonor);

/**
 * @route PATCH /api/need-request/:id/appointment
 * @access Private (Staff only)
 * @description Update appointment date for blood collection
 *
 * Appointment scheduling:
 * - Set donation appointment time
 * - Coordinate với donor availability
 * - Send calendar invitations
 * - Handle rescheduling requests
 * - Sync với hospital schedule
 */
router.patch(
  "/:id/appointment",
  restrictTo("Staff"),
  ctrl.updateAppointmentDate
);

/**
 * Export need request router
 * @description Router này handle blood need request lifecycle:
 *
 * Request Workflow:
 * 1. Member creates need request với medical documentation
 * 2. Staff reviews và approves/rejects request
 * 3. System assigns compatible blood units
 * 4. Staff fulfills request và notifies requester
 * 5. Member confirms receipt và completes transaction
 *
 * Permission Matrix:
 * - Member: Create own requests, view own history, confirm completion
 * - Staff: Full request management, blood unit assignment, donor coordination
 * - Admin: All staff permissions plus system-wide analytics
 *
 * Business Rules:
 * - Daily request limits để prevent abuse
 * - Blood compatibility validation
 * - Medical document requirements
 * - Status transition validations
 * - Audit trail cho all operations
 */
module.exports = router;
