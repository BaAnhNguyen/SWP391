/**
 * @fileoverview Donation Registration Model for Blood Donation Management System
 * @description Mongoose model để handle donation appointment scheduling và workflow
 *
 * Chức năng chính:
 * - Store donation registration requests từ users
 * - Manage donation scheduling và appointment system
 * - Track health screening questionnaire responses
 * - Handle donation workflow status transitions
 * - Link to completed donation history records
 *
 * @requires mongoose - MongoDB object modeling
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const { Schema, model, Types } = require("mongoose");

/**
 * @schema screeningQuestionSchema
 * @description Embedded schema cho health screening responses
 *
 * Stores individual question-answer pairs:
 * - Health screening questions (from Question model)
 * - Boolean answers (Yes/No responses)
 * - Used để determine donation eligibility
 * - Preserved cho medical records
 */
const screeningQuestionSchema = new Schema(
  {
    /**
     * @field question
     * @type {String}
     * @required true
     * @description The health screening question text
     *
     * Question content:
     * - Medical eligibility questions
     * - Health history inquiries
     * - Risk assessment questions
     * - Travel và exposure screening
     */
    question: { type: String, required: true },

    /**
     * @field answer
     * @type {Boolean}
     * @required true
     * @description User's response to the question
     *
     * Answer format:
     * - true: Yes response
     * - false: No response
     * - Used cho eligibility determination
     * - Affects donation approval
     */
    answer: { type: Boolean, required: true },
  },
  { _id: false } // Embedded document, no separate _id
);

/**
 * @schema donationSchema
 * @description Main schema cho donation registration records
 *
 * Handles complete donation registration workflow:
 * - User registration intent
 * - Health screening completion
 * - Staff approval/rejection
 * - Donation completion tracking
 */
const donationSchema = new Schema(
  {
    /**
     * @field userId
     * @type {ObjectId}
     * @ref User
     * @required true
     * @description Reference to user registering cho donation
     *
     * User linkage:
     * - Connects registration to user account
     * - Enables personal donation history
     * - Used cho eligibility checking
     * - Required cho all registrations
     */
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * @field bloodGroup
     * @type {String}
     * @enum ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "unknown"]
     * @default "unknown"
     * @description User's blood group at registration
     *
     * Blood type information:
     * - May be unknown at registration
     * - Confirmed during actual donation
     * - Used cho inventory planning
     * - Updated when verified
     */
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "unknown"],
      default: "unknown",
    },

    /**
     * @field component
     * @type {String}
     * @enum ["WholeBlood", "Plasma", "Platelets", "RedCells", "unknown"]
     * @default "unknown"
     * @description Type of blood component to donate
     *
     * Component preferences:
     * - WholeBlood: Standard donation (most common)
     * - Plasma: Plasma donation (apheresis)
     * - Platelets: Platelet donation (apheresis)
     * - RedCells: Red cell donation (apheresis)
     * - Usually determined at appointment
     */
    component: {
      type: String,
      enum: ["WholeBlood", "Plasma", "Platelets", "RedCells", "unknown"],
      default: "unknown",
    },

    /**
     * @field readyDate
     * @type {Date}
     * @required true
     * @description User's preferred donation date
     *
     * Appointment scheduling:
     * - User selects preferred date/time
     * - Subject to availability
     * - Can be rescheduled by staff
     * - Must meet eligibility requirements
     */
    readyDate: {
      type: Date,
      required: true,
    },

    /**
     * @field status
     * @type {String}
     * @enum ["Pending", "Approved", "Rejected", "Completed", "Failed"]
     * @default "Pending"
     * @description Current registration status
     *
     * Status workflow:
     * - Pending: Initial submission, awaiting review
     * - Approved: Health screening passed, scheduled
     * - Rejected: Health screening failed, cannot donate
     * - Completed: Donation successfully completed
     * - Failed: Donation attempted but failed
     */
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed", "Failed"],
      default: "Pending",
    },

    /**
     * @field rejectionReason
     * @type {String}
     * @default ""
     * @description Reason cho rejection if applicable
     *
     * Rejection reasons:
     * - Health screening failures
     * - Medical eligibility issues
     * - Recent donation timing
     * - Medical conditions discovered
     * - Helps user understand và improve
     */
    rejectionReason: {
      type: String,
      default: "",
    },

    /**
     * @field nextReadyDate
     * @type {Date}
     * @description Next eligible donation date if rejected
     *
     * Future eligibility:
     * - Calculated when user is temporarily ineligible
     * - Based on rejection reason
     * - Helps users plan future donations
     * - Optional field (not always applicable)
     */
    nextReadyDate: {
      // Ngày được hẹn hiến lại (tuỳ chọn)
      type: Date,
    },

    /**
     * @field completedBy
     * @type {ObjectId}
     * @ref User
     * @description Staff member who completed the donation
     *
     * Staff tracking:
     * - Records which staff handled donation
     * - Used cho accountability
     * - Quality control tracking
     * - Performance metrics
     */
    completedBy: { type: Types.ObjectId, ref: "User" },

    /**
     * @field completedAt
     * @type {Date}
     * @description Timestamp when donation was completed
     *
     * Completion tracking:
     * - Actual completion time
     * - Used cho reporting
     * - Performance metrics
     * - Different từ registration time
     */
    completedAt: { type: Date },

    /**
     * @field historyId
     * @type {ObjectId}
     * @ref DonationHistory
     * @description Link to permanent donation history record
     *
     * History linkage:
     * - Set when donation completed successfully
     * - Links to permanent medical record
     * - Used cho donation tracking
     * - Enables historical analysis
     */
    historyId: {
      type: Types.ObjectId,
      ref: "DonationHistory",
    },

    /**
     * @field screening
     * @type {Array}
     * @default []
     * @description Health screening questionnaire responses
     *
     * Screening data:
     * - Array of question-answer pairs
     * - Based on current screening questions
     * - Used cho eligibility determination
     * - Preserved cho medical records
     */
    screening: {
      type: [screeningQuestionSchema],
      default: [],
    },

    /**
     * @field confirmation
     * @type {Boolean}
     * @default false
     * @required true
     * @description User confirmation của registration terms
     *
     * Consent tracking:
     * - User agrees to donation terms
     * - Required cho all registrations
     * - Legal compliance requirement
     * - Cannot proceed without confirmation
     */
    confirmation: { type: Boolean, default: false, required: true },
  },
  { timestamps: true } // Automatically add createdAt và updatedAt
);

/**
 * Export DonationRegistration model
 * @description Model này handles donation appointment system:
 *
 * Key Features:
 * - Donation intent registration
 * - Health screening questionnaire
 * - Appointment scheduling system
 * - Status workflow management
 * - Staff completion tracking
 *
 * Registration Workflow:
 * 1. User submits donation registration
 * 2. Health screening questionnaire completed
 * 3. Staff reviews screening results
 * 4. Registration approved/rejected based on eligibility
 * 5. If approved: Appointment scheduled
 * 6. Donation completed và linked to history
 * 7. Registration marked as completed
 *
 * Status Transitions:
 * - Pending → Approved (health screening passed)
 * - Pending → Rejected (health screening failed)
 * - Approved → Completed (donation successful)
 * - Approved → Failed (donation attempted but failed)
 *
 * Business Rules:
 * - User must complete health screening
 * - Staff approval required trước donation
 * - Rejected users given future eligibility date
 * - Completed donations create history records
 * - Failed donations still count cho eligibility timing
 *
 * Integration Points:
 * - User authentication system
 * - Health screening questionnaire (Question model)
 * - Donation completion workflow
 * - Donation history creation
 * - Staff management system
 * - Appointment scheduling system
 */
module.exports = model("DonationRegistration", donationSchema);
