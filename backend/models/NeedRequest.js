/**
 * @fileoverview Need Request Model for Blood Donation Management System
 * @description Mongoose model để handle blood need requests từ patients/hospitals
 *
 * Chức năng chính:
 * - Store blood need requests từ patients hoặc medical facilities
 * - Manage request workflow từ submission đến completion
 * - Track blood unit assignments và fulfillment
 * - Support medical documentation và appointment scheduling
 * - Enable request status monitoring và updates
 *
 * @requires mongoose - MongoDB object modeling
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const {
  Schema,
  model,
  Types,
  trusted,
  default: mongoose,
} = require("mongoose");

/**
 * @schema needRequestSchema
 * @description Schema cho blood need request management
 *
 * Handles complete blood request lifecycle:
 * - Request submission với medical documentation
 * - Blood type và component specification
 * - Staff review và blood unit assignment
 * - Fulfillment tracking và completion
 */
const needRequestSchema = new Schema(
  {
    /**
     * @field createdBy
     * @type {ObjectId}
     * @ref User
     * @required true
     * @description User who created the blood need request
     *
     * Request creator:
     * - Patient, family member, or medical staff
     * - Links request to user account
     * - Used cho request ownership và permissions
     * - Enables request history tracking
     */
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * @field bloodGroup
     * @type {String}
     * @enum ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
     * @required true
     * @description Required blood group cho the request
     *
     * Blood type specification:
     * - Patient's blood group from medical records
     * - Used cho compatibility matching
     * - Critical cho safe blood transfusion
     * - Must match available blood units
     */
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      required: true,
    },

    /**
     * @field component
     * @type {String}
     * @enum ["WholeBlood", "Plasma", "Platelets", "RedCells"]
     * @required true
     * @description Type of blood component needed
     *
     * Component types:
     * - WholeBlood: Complete blood với all components
     * - Plasma: Liquid portion, cho clotting factors
     * - Platelets: For clotting support, surgery cases
     * - RedCells: For oxygen transport, anemia cases
     */
    component: {
      type: String,
      enum: ["WholeBlood", "Plasma", "Platelets", "RedCells"],
      required: true,
    },

    /**
     * @field units
     * @type {Number}
     * @required true
     * @min 1
     * @description Number of blood units requested
     *
     * Unit quantity:
     * - Based on medical need assessment
     * - Minimum 1 unit required
     * - Multiple units cho major procedures
     * - Used cho inventory allocation
     */
    units: {
      type: Number,
      required: true,
      min: 1,
    },

    /**
     * @field reason
     * @type {String}
     * @description Medical reason cho blood request
     *
     * Medical justification:
     * - Surgery requirements
     * - Medical emergency
     * - Chronic condition treatment
     * - Trauma/accident care
     * - Helps prioritize urgent requests
     */
    reason: {
      type: String,
    },

    /**
     * @field status
     * @type {String}
     * @enum ["Pending", "Assigned", "Fulfilled", "Rejected", "Expired", "Canceled", "Completed"]
     * @default "Pending"
     * @description Current status của blood request
     *
     * Status workflow:
     * - Pending: Initial submission, awaiting review
     * - Assigned: Blood units assigned to request
     * - Fulfilled: Blood ready cho pickup/delivery
     * - Rejected: Request denied (insufficient inventory, invalid)
     * - Expired: Request timed out without fulfillment
     * - Canceled: Request canceled by requester
     * - Completed: Blood received by patient/hospital
     */
    status: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "Fulfilled",
        "Rejected",
        "Expired",
        "Canceled",
        "Completed",
      ],
      default: "Pending",
    },

    /**
     * @field attachment
     * @type {String}
     * @required false
     * @description URL của uploaded medical documentation
     *
     * Medical documentation:
     * - Doctor's prescription/order
     * - Medical report justifying need
     * - Hospital requisition form
     * - Stored as file URL on server/cloud
     * - Used cho request verification
     */
    attachment: {
      type: String, // Lưu URL của file ảnh trên server/cloud
      required: false,
    },

    /**
     * @field appointmentDate
     * @type {Date}
     * @description Scheduled date cho blood pickup/delivery
     *
     * Appointment scheduling:
     * - When blood will be available
     * - Pickup appointment at blood bank
     * - Delivery appointment to hospital
     * - Coordinated với medical facility
     */
    appointmentDate: { type: Date },

    /**
     * @field fulfilledAt
     * @type {Date}
     * @description Timestamp when request was fulfilled
     *
     * Fulfillment tracking:
     * - When blood units were prepared
     * - Ready cho pickup/delivery
     * - Marks transition to fulfilled status
     * - Used cho performance metrics
     */
    fulfilledAt: { type: Date },

    /**
     * @field completedAt
     * @type {Date}
     * @description Timestamp when request was completed
     *
     * Completion tracking:
     * - When blood was delivered to patient/hospital
     * - Final step trong request lifecycle
     * - Used cho outcome tracking
     * - Enables request analytics
     */
    completedAt: { type: Date },
  },
  { timestamps: true } // Automatically add createdAt và updatedAt
);

/**
 * Export NeedRequest model
 * @description Model này handles blood need request system:
 *
 * Key Features:
 * - Blood need request submission
 * - Medical documentation support
 * - Blood unit assignment workflow
 * - Status tracking và monitoring
 * - Appointment scheduling system
 *
 * Request Workflow:
 * 1. User creates need request với medical justification
 * 2. Staff reviews request và medical documentation
 * 3. Compatible blood units assigned to request
 * 4. Request marked as fulfilled when units ready
 * 5. Appointment scheduled cho pickup/delivery
 * 6. Request completed when blood delivered
 *
 * Status Transitions:
 * - Pending → Assigned (blood units allocated)
 * - Assigned → Fulfilled (blood prepared)
 * - Fulfilled → Completed (blood delivered)
 * - Any status → Rejected (if issues arise)
 * - Any status → Canceled (if user cancels)
 *
 * Blood Compatibility:
 * - A+ can receive: A+, A-, O+, O-
 * - A- can receive: A-, O-
 * - B+ can receive: B+, B-, O+, O-
 * - B- can receive: B-, O-
 * - AB+ can receive: All types (universal recipient)
 * - AB- can receive: AB-, A-, B-, O-
 * - O+ can receive: O+, O-
 * - O- can receive: O- only
 *
 * Business Rules:
 * - Medical documentation may be required
 * - Urgent requests prioritized
 * - Blood compatibility strictly enforced
 * - Appointment scheduling coordinated
 * - Request expiration handling
 * - Audit trail maintained
 *
 * Integration Points:
 * - Blood unit inventory system
 * - User authentication system
 * - File upload system (medical documents)
 * - Appointment scheduling system
 * - Notification system (status updates)
 * - Analytics và reporting system
 */
module.exports = model("NeedRequest", needRequestSchema);
