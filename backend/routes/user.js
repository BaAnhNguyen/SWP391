/**
 * @fileoverview User Management Routes for Blood Donation Management System
 * @description Routes xử lý user profile, search, và admin functions
 *
 * Chức năng chính:
 * - User profile management (view/update personal info)
 * - Emergency alert system status management
 * - Geographic search cho blood donors nearby
 * - Admin user management (roles, ban/unban, delete)
 *
 * @requires express.Router - Express router instance
 * @requires ../controllers/userController - User management controllers
 * @requires ../controllers/searchByDistance - Geographic search functionality
 * @requires ../middlewares/auth - Authentication và authorization middleware
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const router = require("express").Router();
const ctrl = require("../controllers/userController");
const search = require("../controllers/searchByDistance");
const { protect, restrictTo } = require("../middlewares/auth");

/**
 * @middleware protect
 * @description Tất cả routes trong file này require authentication
 *
 * Apply protect middleware cho tất cả routes:
 * - Verify JWT token trong Authorization header
 * - Load user information vào req.user
 * - Block access nếu token invalid hoặc user bị ban
 */
router.use(protect);

/**
 * @section User Profile Management
 * @description Routes cho personal profile management
 */

/**
 * @route GET /api/user/me
 * @access Private (All authenticated users)
 * @description Get current user profile information
 *
 * Return thông tin profile của user hiện tại:
 * - Personal information (name, email, bloodGroup, etc.)
 * - Location information nếu có
 * - Role và verification status
 * - Không include sensitive data như password
 */
router.get("/me", ctrl.getMe);

/**
 * @route PATCH /api/user/me
 * @access Private (All authenticated users)
 * @description Update current user profile
 *
 * Allow users update profile information:
 * - Personal info: fullName, phoneNumber, bloodGroup
 * - Address information và coordinates
 * - Medical information nếu cần
 * - Validate input data và prevent privilege escalation
 */
router.patch("/me", ctrl.updateMe);

/**
 * @section Emergency Alert System
 * @description Routes cho emergency blood donation alerts
 */

/**
 * @route GET /api/user/emergency-alert
 * @access Private (All authenticated users)
 * @description Get emergency alert system status
 *
 * Check system-wide emergency alert status:
 * - Trả về whether emergency mode đang active
 * - All users có thể read status này
 * - Used để hiển thị emergency banners trong UI
 */
router.get("/emergency-alert", ctrl.getEmergencyAlertStatus);

/**
 * @section Geographic Search
 * @description Routes cho location-based donor search
 */

/**
 * @route GET /api/user/nearby
 * @access Private (Staff only)
 * @description Search for donors within specified distance
 *
 * Geographic search functionality:
 * - Find donors within radius từ specified coordinates
 * - Filter by blood group compatibility
 * - Staff-only để protect user privacy
 * - Return donor contacts cho emergency cases
 *
 * Query parameters:
 * - lat: latitude of search center
 * - lng: longitude of search center
 * - distance: search radius in kilometers
 * - bloodGroup: required blood group
 */
router.get("/nearby", restrictTo("Staff"), search.searchByDistance);

/**
 * @section Admin Management
 * @description Admin-only routes cho user management
 *
 * Tất cả routes below require Admin role:
 * - User listing và management
 * - Role assignment và permission management
 * - User banning và account deletion
 * - System-wide emergency alert controls
 */
router.use(restrictTo("Admin"));

/**
 * @route GET /api/user/
 * @access Private (Admin only)
 * @description Get all users with pagination và filtering
 *
 * Admin user listing:
 * - Paginated results với search/filter options
 * - Include user statistics và activity status
 * - Support sorting by registration date, activity, etc.
 */
router.get("/", ctrl.getAll);

/**
 * @route PATCH /api/user/:id/role
 * @access Private (Admin only)
 * @description Update user role/permissions
 *
 * Role management functionality:
 * - Change user role (Guest → Member → Staff → Admin)
 * - Validate role transitions và business rules
 * - Log role changes cho audit trail
 * - Prevent self-demotion của current admin
 */
router.patch("/:id/role", ctrl.updateRole);

/**
 * @route DELETE /api/user/:id
 * @access Private (Admin only)
 * @description Delete user account
 *
 * Account deletion:
 * - Soft delete để preserve data integrity
 * - Handle related records (donations, requests, etc.)
 * - Cannot delete other admins
 * - Log deletion for audit purposes
 */
router.delete("/:id", ctrl.delete);

/**
 * @route PATCH /api/user/ban/:userId
 * @access Private (Admin only)
 * @description Ban user account
 *
 * User banning system:
 * - Set ban status và reason
 * - Block login và API access
 * - Notify user về ban status
 * - Cannot ban other admins
 */
router.patch("/ban/:userId", restrictTo("Admin"), ctrl.banUser);

/**
 * @route PATCH /api/user/unban/:userId
 * @access Private (Admin only)
 * @description Unban user account
 *
 * Remove ban from user:
 * - Restore account access
 * - Clear ban reason và timestamp
 * - Log unban action
 * - Send reactivation notification
 */
router.patch("/unban/:userId", restrictTo("Admin"), ctrl.unbanUser);

/**
 * @route PATCH /api/user/toggle-emergency-alert
 * @access Private (Admin only)
 * @description Toggle system-wide emergency alert status
 *
 * Emergency alert system control:
 * - Enable/disable emergency mode
 * - Trigger notifications đến all active donors
 * - Show emergency banners in frontend
 * - Log emergency status changes
 */
router.patch(
  "/toggle-emergency-alert",
  restrictTo("Admin"),
  ctrl.toggleEmergencyAlert
);

/**
 * Export user management router
 * @description Router này handle user-related operations:
 *
 * Permission Levels:
 * - All authenticated: profile management, emergency status read
 * - Staff: geographic search for donor coordination
 * - Admin: full user management, system controls
 *
 * Security Features:
 * - JWT authentication required cho tất cả routes
 * - Role-based access control
 * - Ban status checking
 * - Input validation và sanitization
 * - Audit logging cho admin actions
 */
module.exports = router;
