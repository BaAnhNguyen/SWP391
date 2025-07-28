/**
 * @fileoverview Donation Registration Routes for Blood Donation Management System
 * @description Routes xử lý blood donation registration và management workflow
 *
 * Chức năng chính:
 * - Donation registration creation và scheduling
 * - Member donation history và eligibility tracking
 * - Staff donation workflow management
 * - Health screening và completion processes
 * - Donation frequency monitoring
 *
 * @requires express.Router - Express router instance
 * @requires ../controllers/donateRegistrationController - Donation registration controllers
 * @requires ../middlewares/auth - Authentication và role-based access control
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const router = require("express").Router();
const ctrl = require("../controllers/donateRegistrationController");
const { protect, restrictTo } = require("../middlewares/auth");

/**
 * @middleware protect
 * @description Tất cả donation routes require authentication
 *
 * Apply JWT authentication:
 * - Verify valid token trong Authorization header
 * - Load authenticated user data vào req.user
 * - Block banned users từ donation system
 * - Ensure proper role-based access control
 */
router.use(protect);

/**
 * @section Member Donation Management
 * @description Routes cho member donation activities
 */

/**
 * @route POST /api/donate-registration/
 * @access Private (All authenticated users)
 * @description Create new blood donation registration
 *
 * Donation registration process:
 * - Submit donation intent với preferred date/time
 * - Complete health screening questionnaire
 * - Check eligibility based on last donation date
 * - Schedule appointment với blood bank
 * - Send confirmation notifications
 * - Initialize donation tracking record
 */
router.post("/", ctrl.create);

/**
 * @route GET /api/donate-registration/me
 * @access Private (All authenticated users)
 * @description Get user's own donation history
 *
 * Personal donation dashboard:
 * - List all user's donation registrations
 * - Show status progression (Scheduled → Completed/Failed)
 * - Include appointment details và locations
 * - Display health screening results
 * - Track total donation impact statistics
 */
router.get("/me", ctrl.listMine);

/**
 * @route GET /api/donate-registration/countToday
 * @access Private (All authenticated users)
 * @description Count donations registered today by user
 *
 * Daily registration limit check:
 * - Prevent multiple registrations per day
 * - Show current registration count
 * - Enforce business rules cho donation frequency
 * - Display remaining registration slots
 */
router.get("/countToday", ctrl.countToday);

/**
 * @route GET /api/donate-registration/nextEligibleDate
 * @access Private (Member only)
 * @description Calculate next eligible donation date
 *
 * Eligibility calculation:
 * - Based on last successful donation date
 * - Consider blood group specific intervals (8-12 weeks)
 * - Factor in health conditions hoặc deferral periods
 * - Return formatted date với reasoning
 * - Help users plan future donations
 */
router.get("/nextEligibleDate", restrictTo("Member"), ctrl.getNextEligibleDate);

/**
 * @section Staff Donation Workflow
 * @description Routes cho staff donation management
 */

/**
 * @route GET /api/donate-registration/
 * @access Private (Staff only)
 * @description Get all donation registrations for staff management
 *
 * Staff dashboard listing:
 * - View all scheduled donations
 * - Filter by status, date, blood group
 * - Sort by appointment time hoặc priority
 * - Include donor contact information
 * - Show health screening results
 * - Pagination cho large datasets
 */
router.get("/", restrictTo("Staff"), ctrl.listAll);

/**
 * @route PATCH /api/donate-registration/:id/status
 * @access Private (Staff only)
 * @description Update donation registration status
 *
 * Status management workflow:
 * - Update từ "Scheduled" → "In Progress" → "Completed"
 * - Handle "Cancelled" hoặc "No Show" cases
 * - Track status transition timestamps
 * - Send status update notifications đến donor
 * - Log changes cho audit trail
 */
router.patch("/:id/status", restrictTo("Staff"), ctrl.updateStatus);

/**
 * @route POST /api/donate-registration/:id/complete
 * @access Private (Staff only)
 * @description Mark donation as successfully completed
 *
 * Donation completion process:
 * - Record blood units collected
 * - Update donor's donation history
 * - Create BloodUnit records trong inventory
 * - Calculate next eligible donation date
 * - Send thank you notifications
 * - Update system donation statistics
 * - Generate donation certificates
 */
router.post("/:id/complete", restrictTo("Staff"), ctrl.complete);

/**
 * @route POST /api/donate-registration/:id/failed
 * @access Private (Staff only)
 * @description Mark donation as failed health screening
 *
 * Failed screening handling:
 * - Record specific health screening failures
 * - Set temporary hoặc permanent deferral periods
 * - Provide health improvement recommendations
 * - Schedule follow-up consultations nếu needed
 * - Send educational materials về health requirements
 * - Update donor eligibility status
 */
router.post("/:id/failed", restrictTo("Staff"), ctrl.failedHealthCheck);

/**
 * @section Shared Management Operations
 * @description Routes accessible to both staff và members với different permissions
 */

/**
 * @route DELETE /api/donate-registration/:id
 * @access Private (Staff/Member only)
 * @description Delete donation registration
 *
 * Registration cancellation:
 * - Staff: Can cancel any registration với notification
 * - Member: Can only cancel own future registrations
 * - Handle appointment slot redistribution
 * - Send cancellation notifications
 * - Free up resources cho other donors
 * - Log cancellation reasons
 */
router.delete("/:id", restrictTo("Staff", "Member"), ctrl.delete);

/**
 * @route PATCH /api/donate-registration/:id
 * @access Private (Staff/Member only)
 * @description Update donation registration details
 *
 * Registration modification:
 * - Staff: Update any field, reschedule appointments, modify notes
 * - Member: Limited to rescheduling và contact info updates
 * - Validate changes against business rules
 * - Send update notifications đến relevant parties
 * - Maintain modification audit trail
 * - Handle resource reallocation nếu needed
 */
router.patch("/:id", restrictTo("Staff", "Member"), ctrl.update);

/**
 * Export donation registration router
 * @description Router này handle donation registration lifecycle:
 *
 * Donation Flow:
 * 1. Member registers donation intent
 * 2. System checks eligibility và schedules appointment
 * 3. Staff conducts health screening on appointment day
 * 4. If passed: Complete donation và create blood units
 * 5. If failed: Record deferral và provide guidance
 * 6. Update donor history và calculate next eligible date
 *
 * Business Rules:
 * - Minimum 56 days between whole blood donations
 * - Maximum 1 registration per day per user
 * - Health screening requirements must be met
 * - Age và weight restrictions apply
 * - Medical history deferral periods
 *
 * Permission Matrix:
 * - All Users: Create registrations, view own history
 * - Member: Check eligibility dates, cancel own appointments
 * - Staff: Full workflow management, health screening, completion
 * - Admin: All staff permissions plus system analytics
 *
 * Integration Points:
 * - Blood inventory system (BloodUnit creation)
 * - Email notification service
 * - Appointment scheduling system
 * - Health screening questionnaire
 * - Donor impact tracking
 */
module.exports = router;
