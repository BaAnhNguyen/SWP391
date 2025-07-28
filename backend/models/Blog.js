/**
 * @fileoverview Blog Model for Blood Donation Management System
 * @description Mongoose model để handle blog posts và news articles
 *
 * Chức năng chính:
 * - Store blog posts và news content
 * - Support content moderation workflow (Pending → Approved/Rejected)
 * - Handle image uploads cho blog illustrations
 * - Link posts to authors via User references
 * - Enable community content management
 *
 * @requires mongoose - MongoDB object modeling
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const { model, Schema, Types } = require("mongoose");

/**
 * @schema blogSchema
 * @description Schema cho blog post content management
 *
 * Supports content creation workflow:
 * - Author creates post content
 * - Content goes through moderation
 * - Approved posts visible to public
 * - Image support cho visual content
 */
const blogSchema = new Schema(
  {
    /**
     * @field title
     * @type {String}
     * @required true
     * @description Blog post title/headline
     *
     * Title guidelines:
     * - Descriptive và engaging headlines
     * - SEO-friendly titles
     * - Clear indication của content topic
     * - Appropriate length cho readability
     */
    title: {
      type: String,
      require: true,
    },

    /**
     * @field content
     * @type {String}
     * @required true
     * @description Main blog post content body
     *
     * Content features:
     * - Rich text support
     * - Educational blood donation information
     * - News và announcements
     * - Success stories và testimonials
     * - Medical information và guidelines
     */
    content: {
      type: String,
      required: true,
    },

    /**
     * @field author
     * @type {ObjectId}
     * @ref User
     * @required true
     * @description Reference to post author
     *
     * Author information:
     * - Links post to authenticated user
     * - Enables author-based content management
     * - Supports author profile display
     * - Used cho permission checking
     */
    author: { type: Types.ObjectId, ref: "User", require: true },

    /**
     * @field status
     * @type {String}
     * @enum ["Pending", "Approved", "Rejected"]
     * @default "Pending"
     * @description Content moderation status
     *
     * Status workflow:
     * - Pending: Newly created, awaiting review
     * - Approved: Reviewed và published
     * - Rejected: Not approved cho publication
     */
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    /**
     * @field images
     * @type {Array}
     * @description Image attachments cho blog post
     *
     * Image structure:
     * - url: Image file URL
     * - public_id: Cloud storage identifier
     * - description: Alt text cho accessibility
     *
     * Validation:
     * - Maximum 1 image per post
     * - Image size và format restrictions
     * - Cloud storage integration
     */
    images: {
      type: [
        {
          url: String,
          public_id: String,
          description: String,
        },
      ],
      validate: {
        validator: function (v) {
          return v.length <= 1;
        },
        message: "Chỉ được upload tối đa 1 ảnh!",
      },
    },
  },
  { timestamps: true } // Automatically add createdAt và updatedAt
);

/**
 * Export Blog model
 * @description Model này handles blog content system:
 *
 * Content Types:
 * - Educational articles về blood donation
 * - News và announcements
 * - Success stories từ donors và recipients
 * - Medical guidelines và safety information
 * - Event announcements và campaigns
 *
 * Moderation Workflow:
 * 1. Member creates blog post (status: Pending)
 * 2. Staff/Admin reviews content
 * 3. Content approved → visible to public
 * 4. Content rejected → author notified với feedback
 *
 * Business Rules:
 * - Only approved posts visible to public
 * - Authors can edit own pending posts
 * - Admin can moderate any content
 * - Maximum 1 image per post
 * - Content quality standards enforced
 */
module.exports = model("Blog", blogSchema);
