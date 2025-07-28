/**
 * @fileoverview Comment Model for Blood Donation Management System
 * @description Mongoose model để handle blog comment system
 *
 * Chức năng chính:
 * - Store user comments cho blog posts
 * - Support nested comment replies (threaded discussions)
 * - Link comments to specific blog posts và authors
 * - Enable community engagement và feedback
 * - Support comment moderation workflows
 *
 * @requires mongoose - MongoDB object modeling
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const { Schema, model, Types } = require("mongoose");

/**
 * @schema commentSchema
 * @description Schema cho blog comment system
 *
 * Supports hierarchical comment structure:
 * - Top-level comments on blog posts
 * - Nested replies to other comments
 * - Author attribution và timestamp tracking
 * - Content moderation capabilities
 */
const commentSchema = new Schema(
  {
    /**
     * @field post
     * @type {ObjectId}
     * @ref Blog
     * @required true
     * @description Reference đến blog post being commented on
     *
     * Links comment to specific blog post:
     * - Enables comment listing by post
     * - Supports comment counting per post
     * - Maintains referential integrity
     * - Used cho comment display và organization
     */
    post: {
      type: Types.ObjectId,
      ref: "Blog",
      required: true,
    },

    /**
     * @field author
     * @type {ObjectId}
     * @ref User
     * @required true
     * @description Reference đến user who wrote the comment
     *
     * Author information:
     * - Links comment to authenticated user
     * - Enables author-based comment management
     * - Supports comment ownership verification
     * - Used cho displaying commenter info
     */
    author: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * @field content
     * @type {String}
     * @required true
     * @description The actual comment text content
     *
     * Comment content rules:
     * - Plain text content (HTML stripped)
     * - Reasonable length limits
     * - Content moderation applied
     * - Must not be empty
     */
    content: {
      type: String,
      required: true,
    },

    /**
     * @field parent
     * @type {ObjectId}
     * @ref Comment
     * @default null
     * @description Reference to parent comment cho threaded replies
     *
     * Threaded comment system:
     * - null: Top-level comment (direct post comment)
     * - ObjectId: Reply to another comment
     * - Supports nested discussion threads
     * - Enables comment hierarchy display
     *
     * Business rules:
     * - Maximum nesting depth to prevent deep threads
     * - Parent comment must belong to same post
     * - Cannot reply to deleted comments
     */
    parent: { type: Types.ObjectId, ref: "Comment", default: null },
  },
  { timestamps: true } // Automatically add createdAt và updatedAt
);

/**
 * Export Comment model
 * @description Model này handles blog comment system:
 *
 * Key Features:
 * - Threaded comment discussions
 * - Author attribution và ownership
 * - Post-specific comment organization
 * - Nested reply structure
 * - Timestamp tracking
 *
 * Comment Hierarchy:
 * - Level 0: Direct comments on blog posts (parent: null)
 * - Level 1: Replies to post comments (parent: comment_id)
 * - Level 2: Replies to replies (nested discussion)
 * - Maximum depth limits để prevent excessive nesting
 *
 * Business Rules:
 * - Users can comment on approved blog posts
 * - Comments must be linked to valid posts
 * - Authors can manage their own comments
 * - Admin can moderate any comment
 * - Reply hierarchy preserved during operations
 *
 * Permission Matrix:
 * - Public: View approved comments
 * - Member: Create comments, manage own comments
 * - Admin: Full comment moderation powers
 * - Staff: Same as Member level
 *
 * Integration Points:
 * - Blog post system (post references)
 * - User authentication system
 * - Notification system (new comment alerts)
 * - Content moderation tools
 * - Community engagement metrics
 */
module.exports = model("Comment", commentSchema);
