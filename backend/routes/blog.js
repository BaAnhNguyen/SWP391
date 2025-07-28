/**
 * @fileoverview Blog & News Management Routes for Blood Donation Management System
 * @description Routes xử lý blog posts, news articles và content management
 *
 * Chức năng chính:
 * - Public blog listing và article viewing
 * - Blog post creation với image upload support
 * - Content moderation workflow (pending → approved/rejected)
 * - Author blog management (my posts)
 * - Multi-image upload functionality
 *
 * @requires express.Router - Express router instance
 * @requires ../middlewares/auth - Authentication và role-based access control
 * @requires ../middlewares/blogUpload - File upload middleware cho blog images
 * @requires ../controllers/blogController - Blog management controllers
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const router = require("express").Router();
const { protect, restrictTo } = require("../middlewares/auth");
const blogUpload = require("../middlewares/blogUpload");
const ctrl = require("../controllers/blogController");

/**
 * @section Public Blog Access
 * @description Public routes cho blog content viewing
 */

/**
 * @route GET /api/blog/
 * @access Public
 * @description Get all approved blog posts for public viewing
 *
 * Public blog listing:
 * - Show only approved/published blog posts
 * - Support pagination cho large blog collections
 * - Filter by categories (education, news, events, success stories)
 * - Sort by publish date (newest first)
 * - Include author information và publish date
 * - SEO-friendly với proper metadata
 * - Cache results để improve performance
 */
router.get("/", ctrl.getBlog);

/**
 * @section Authenticated Blog Management
 * @description Routes requiring authentication, ordered by specificity
 *
 * Note: Static routes MUST be placed before dynamic routes
 * để avoid route parameter conflicts
 */

/**
 * @route GET /api/blog/mine
 * @access Private (Admin/Member only)
 * @description Get user's own blog posts
 *
 * Author dashboard:
 * - List all posts created by current user
 * - Show post status (Draft/Pending/Approved/Rejected)
 * - Include view counts và engagement metrics
 * - Filter by status hoặc publication date
 * - Allow authors to manage their content
 * - Support post analytics và performance tracking
 */
router.get("/mine", protect, restrictTo("Admin", "Member"), ctrl.getMine);

/**
 * @route POST /api/blog/
 * @access Private (Admin/Member only)
 * @description Create new blog post với image upload
 *
 * Blog post creation:
 * - Accept blog content với rich text formatting
 * - Handle multiple image uploads (max 5 images)
 * - Set initial status to "Pending" cho Member, "Approved" cho Admin
 * - Generate SEO-friendly URL slugs
 * - Extract metadata từ content (reading time, tags)
 * - Send notifications đến moderators for review
 * - Support draft saving functionality
 *
 * Image Upload Rules:
 * - Maximum 5 images per post
 * - Supported formats: JPG, PNG, GIF
 * - Auto-resize và optimize images
 * - Generate thumbnails cho previews
 */
router.post(
  "/",
  protect,
  restrictTo("Admin", "Member"),
  blogUpload.array("images", 5), // Handle multiple image uploads
  ctrl.create
);

/**
 * @route PUT /api/blog/:id/approved
 * @access Private (Admin/Staff only)
 * @description Approve pending blog post
 *
 * Content approval workflow:
 * - Change status từ "Pending" → "Approved"
 * - Set publication date và make post public
 * - Send approval notification đến author
 * - Update content discovery indexes
 * - Log moderation action với moderator info
 * - Trigger social media sharing nếu configured
 */
router.put(
  "/:id/approved",
  protect,
  restrictTo("Admin", "Staff"),
  ctrl.approve
);

/**
 * @route PUT /api/blog/:id/rejected
 * @access Private (Admin/Staff only)
 * @description Reject pending blog post
 *
 * Content rejection workflow:
 * - Change status từ "Pending" → "Rejected"
 * - Provide feedback/reason for rejection
 * - Send rejection notification với improvement suggestions
 * - Allow author to revise và resubmit
 * - Log moderation decision
 * - Maintain content quality standards
 */
router.put("/:id/rejected", protect, restrictTo("Admin", "Staff"), ctrl.reject);

/**
 * @route PUT /api/blog/:id
 * @access Private (Admin/Member only)
 * @description Update existing blog post
 *
 * Blog post editing:
 * - Admin: Can edit any post
 * - Member: Can only edit own posts
 * - Support image replacement/addition (max 5 total)
 * - Reset approval status if content significantly changed
 * - Maintain edit history cho auditing
 * - Re-trigger moderation nếu needed
 * - Update modification timestamps
 */
router.put(
  "/:id",
  protect,
  restrictTo("Admin", "Member"),
  blogUpload.array("images", 5),
  ctrl.update
);

/**
 * @route DELETE /api/blog/:id
 * @access Private (Admin/Member only)
 * @description Delete blog post
 *
 * Blog post deletion:
 * - Admin: Can delete any post
 * - Member: Can only delete own unpublished posts
 * - Soft delete để preserve content history
 * - Handle image cleanup từ storage
 * - Update related statistics
 * - Log deletion action
 * - Cannot delete posts với high engagement without admin approval
 */
router.delete("/:id", protect, restrictTo("Admin", "Member"), ctrl.delete);

/**
 * @route GET /api/blog/pending
 * @access Private (Admin/Staff only)
 * @description Get pending blog posts for moderation
 *
 * Moderation dashboard:
 * - List all posts awaiting approval
 * - Show post preview với content summary
 * - Display author information và submission date
 * - Sort by submission date hoặc priority
 * - Include moderation tools và quick actions
 * - Show pending queue statistics
 * - Support bulk moderation operations
 */
router.get("/pending", protect, restrictTo("Admin", "Staff"), ctrl.getPending);

/**
 * @section Image Upload Management
 * @description Standalone image upload functionality
 */

/**
 * @route POST /api/blog/upload-images
 * @access Private (Admin/Member only)
 * @description Upload images separately for blog posts
 *
 * Standalone image upload:
 * - Support up to 10 images per upload
 * - Return image URLs cho rich text editor integration
 * - Generate different sizes (thumbnail, medium, full)
 * - Validate image format và size
 * - Optimize images cho web delivery
 * - Used by rich text editors cho inline images
 *
 * Use Cases:
 * - Rich text editor image insertion
 * - Blog post gallery creation
 * - Image library management
 * - Content draft preparation
 */
router.post(
  "/upload-images",
  protect,
  restrictTo("Admin", "Member"),
  blogUpload.array("images", 10), // Higher limit cho standalone uploads
  ctrl.uploadImages
);

/**
 * @section Dynamic Content Routes
 * @description Dynamic routes MUST be placed last để avoid conflicts
 */

/**
 * @route GET /api/blog/:id
 * @access Public
 * @description Get specific blog post by ID
 *
 * Individual blog post viewing:
 * - Show full blog post content
 * - Include author information và metadata
 * - Track view counts cho analytics
 * - Show related posts suggestions
 * - Include social sharing options
 * - Support SEO metadata injection
 * - Only show approved posts to public
 * - Authors can view their own pending posts
 *
 * Note: This route is placed LAST để ensure static routes
 * like "/mine", "/pending" are matched first
 */
router.get("/:id", ctrl.getBlogById);

/**
 * Export blog router
 * @description Router này handle blog content management:
 *
 * Content Workflow:
 * 1. Member creates blog post với images
 * 2. Post status set to "Pending" (except Admin posts)
 * 3. Staff/Admin reviews content trong moderation queue
 * 4. Post approved → visible to public, hoặc rejected với feedback
 * 5. Authors can view their posts và edit/delete as permitted
 *
 * Content Categories:
 * - Educational: Blood donation facts, health benefits
 * - News: Blood bank updates, campaign announcements
 * - Events: Donation drives, community events
 * - Success Stories: Donor experiences, patient testimonials
 * - Research: Medical studies, donation science
 *
 * Permission Matrix:
 * - Public: View approved posts only
 * - Member: Create posts, manage own content, view own drafts
 * - Staff: Moderate content (approve/reject), view pending queue
 * - Admin: Full content management, bypass moderation
 *
 * Image Management:
 * - Multi-image upload support
 * - Automatic resizing và optimization
 * - CDN integration cho fast delivery
 * - Image cleanup on post deletion
 * - Thumbnail generation cho listings
 *
 * SEO Features:
 * - URL-friendly slugs generation
 * - Meta description extraction
 * - Open Graph tags support
 * - Sitemap integration
 * - Search engine optimization
 */
module.exports = router;
