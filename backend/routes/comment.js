/**
 * @fileoverview Blog Comment Management Routes for Blood Donation Management System
 * @description Routes xử lý comment system cho blog posts
 *
 * Chức năng chính:
 * - Public comment viewing cho blog posts
 * - Authenticated comment creation và management
 * - Comment moderation và content control
 * - User comment history tracking
 *
 * @requires express.Router - Express router instance
 * @requires ../middlewares/auth - Authentication và role-based access control
 * @requires ../controllers/commentController - Comment management controllers
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const router = require("express").Router();
const { protect, restrictTo } = require("../middlewares/auth");
const ctrl = require("../controllers/commentController");

/**
 * @section Public Comment Access
 * @description Public routes cho comment viewing
 */

/**
 * @route GET /api/comment/:postId
 * @access Public
 * @description Get all comments for a specific blog post
 *
 * Public comment listing:
 * - Show all approved comments cho specified blog post
 * - Sort by creation date (oldest first để maintain conversation flow)
 * - Include commenter information (name, avatar)
 * - Support nested replies nếu reply system implemented
 * - Pagination cho posts với many comments
 * - Hide inappropriate hoặc spam comments
 * - Cache frequently accessed comment threads
 *
 * @param {string} postId - Blog post ID to get comments for
 */
router.get("/:postId", ctrl.getComments);

/**
 * @middleware protect
 * @description All comment management operations require authentication
 *
 * Apply JWT authentication:
 * - Verify valid token trong Authorization header
 * - Load authenticated user data vào req.user
 * - Block banned users từ commenting
 * - Enable comment authorship tracking
 */
router.use(protect);

/**
 * @middleware restrictTo
 * @description Limit comment operations to Admin và Member roles
 *
 * Role-based access control:
 * - Admin: Full comment management (create, edit, delete any)
 * - Member: Create comments, edit/delete own comments
 * - Staff: Read-only access (inherited từ Member level)
 * - Guest: Cannot create hoặc manage comments
 */
router.use(restrictTo("Admin", "Member"));

/**
 * @section Comment Management Operations
 * @description Authenticated routes cho comment CRUD operations
 */

/**
 * @route POST /api/comment/
 * @access Private (Admin/Member only)
 * @description Create new comment on blog post
 *
 * Comment creation process:
 * - Validate comment content (length, appropriate language)
 * - Associate comment với specific blog post
 * - Record commenter information từ authenticated user
 * - Set initial status (auto-approved hoặc pending moderation)
 * - Send notification đến blog post author
 * - Update post comment count
 * - Apply rate limiting để prevent spam
 *
 * Validation Rules:
 * - Minimum length: 10 characters
 * - Maximum length: 1000 characters
 * - No inappropriate language
 * - No spam patterns hoặc repeated content
 * - Must reference valid blog post
 */
router.post("/", ctrl.createComment);

/**
 * @route PUT /api/comment/:id
 * @access Private (Admin/Member only - own comments)
 * @description Update existing comment
 *
 * Comment editing functionality:
 * - Admin: Can edit any comment
 * - Member: Can only edit own comments
 * - Preserve edit history cho transparency
 * - Mark comment as edited với timestamp
 * - Re-validate content after editing
 * - Cannot edit comments older than 24 hours (business rule)
 * - Cannot edit comments with replies (để maintain context)
 *
 * Edit Restrictions:
 * - 24-hour edit window
 * - Cannot edit if comment has replies
 * - Must maintain comment's original meaning
 * - Admin override cho moderation purposes
 */
router.put("/:id", ctrl.updateComment);

/**
 * @route DELETE /api/comment/:id
 * @access Private (Admin/Member only - own comments)
 * @description Delete comment
 *
 * Comment deletion process:
 * - Admin: Can delete any comment (with reason)
 * - Member: Can only delete own comments
 * - Soft delete để preserve conversation context
 * - Handle nested replies appropriately
 * - Update parent post comment count
 * - Send notifications nếu moderator deletion
 * - Log deletion reason cho audit trail
 *
 * Deletion Rules:
 * - Cannot delete comments với replies (soft delete shows "Comment deleted")
 * - Admin can force delete inappropriate content
 * - User can delete own comments within reasonable time
 * - Maintain conversation thread integrity
 */
router.delete("/:id", ctrl.deleteComment);

/**
 * Export comment router
 * @description Router này handle blog comment system:
 *
 * Comment System Features:
 * - Public comment viewing cho all blog posts
 * - Authenticated comment creation và management
 * - Role-based permissions (Admin full access, Member limited)
 * - Comment moderation và content filtering
 * - Edit history và audit trail
 *
 * Comment Workflow:
 * 1. User reads blog post và wants to comment
 * 2. Authentication required để post comment
 * 3. Comment validated cho content và spam
 * 4. Comment posted và author notified
 * 5. Users can edit own comments (time-limited)
 * 6. Admin can moderate inappropriate content
 *
 * Permission Matrix:
 * - Public: View approved comments
 * - Member: Create comments, edit/delete own
 * - Admin: Full comment management, moderation tools
 * - Staff: Comment viewing only (no creation/editing)
 *
 * Business Rules:
 * - Comments auto-approved để encourage engagement
 * - 24-hour edit window cho user corrections
 * - Cannot edit comments với replies
 * - Soft delete để preserve conversation context
 * - Rate limiting để prevent spam
 * - Inappropriate content filtering
 *
 * Integration Points:
 * - Blog post system (postId references)
 * - User authentication system
 * - Notification system (comment alerts)
 * - Content moderation tools
 * - Spam detection algorithms
 */
module.exports = router;
