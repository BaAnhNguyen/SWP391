/**
 * @fileoverview Blood Unit Model for Blood Donation Management System
 * @description Mongoose model để manage blood inventory và blood unit tracking
 *
 * Chức năng chính:
 * - Store individual blood unit records trong inventory
 * - Track blood components (Whole Blood, Plasma, Platelets, Red Cells)
 * - Monitor expiration dates và quality control
 * - Link blood units to donor information
 * - Support blood unit assignment to need requests
 *
 * @requires mongoose - MongoDB object modeling
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const { mongoose, Types } = require("mongoose");

/**
 * @schema bloodUnitSchema
 * @description Schema cho blood unit inventory management
 *
 * Represents individual blood units:
 * - Each unit từ successful donation
 * - Different blood types và components
 * - Expiration tracking và quality control
 * - Assignment to patient requests
 */
const bloodUnitSchema = new mongoose.Schema({
  /**
   * @field BloodType
   * @type {String}
   * @required true
   * @enum ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
   * @description ABO/Rh blood type classification
   *
   * Blood type system:
   * - A+/A-: A antigen với/without Rh factor
   * - B+/B-: B antigen với/without Rh factor
   * - AB+/AB-: Both A và B antigens
   * - O+/O-: No A/B antigens (universal donor O-)
   */
  BloodType: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },

  /**
   * @field ComponentType
   * @type {String}
   * @required true
   * @enum ["WholeBlood", "Plasma", "Platelets", "RedCells"]
   * @description Type of blood component
   *
   * Component types:
   * - WholeBlood: Complete blood with all components
   * - Plasma: Liquid portion without blood cells
   * - Platelets: Clotting factors, short shelf life
   * - RedCells: Oxygen-carrying red blood cells
   */
  ComponentType: {
    type: String,
    required: true,
    enum: ["WholeBlood", "Plasma", "Platelets", "RedCells"],
  },

  /**
   * @field Quantity
   * @type {Number}
   * @required true
   * @min 1
   * @default 1
   * @description Number of units
   *
   * Quantity tracking:
   * - Usually 1 unit per donation
   * - Multiple units từ large donations
   * - Batch processing của imported blood
   */
  Quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },

  /**
   * @field Volume
   * @type {Number}
   * @required true
   * @min 1
   * @description Volume trong milliliters (mL)
   *
   * Volume standards:
   * - Whole blood: ~450mL per donation
   * - Plasma: ~200-250mL
   * - Platelets: ~300mL
   * - Red cells: ~200-250mL
   */
  Volume: {
    type: Number, // in mL
    required: true,
    min: 1,
  },

  /**
   * @field DateAdded
   * @type {Date}
   * @required true
   * @default Date.now
   * @description When blood unit was added to inventory
   *
   * Date tracking:
   * - Collection date từ donor
   * - Processing completion date
   * - Inventory entry timestamp
   */
  DateAdded: {
    type: Date,
    required: true,
    default: Date.now,
  },

  /**
   * @field DateExpired
   * @type {Date}
   * @required true
   * @description Expiration date của blood unit
   *
   * Expiration periods:
   * - Whole blood: 35-42 days
   * - Red cells: 42 days
   * - Plasma: 12 months (frozen)
   * - Platelets: 5 days (most critical)
   */
  DateExpired: {
    type: Date,
    required: true,
  },

  /**
   * @field SourceType
   * @type {String}
   * @enum ["donation", "import"]
   * @required true
   * @default "donation"
   * @description Source của blood unit
   *
   * Source types:
   * - donation: From local donors
   * - import: From other blood banks/hospitals
   */
  SourceType: {
    //donation, import
    type: String,
    enum: ["donation", "import"],
    required: true,
    default: "donation",
  },

  /**
   * @field SourceRef
   * @type {ObjectId}
   * @ref DonationHistory
   * @description Reference to donation record nếu từ donation
   *
   * Traceability:
   * - Links blood unit back to original donation
   * - Enables donor tracking và feedback
   * - Support quality control investigations
   * - Required cho donation-sourced units
   */
  SourceRef: {
    //ref toi DonationHistory neu hien mau
    type: mongoose.Schema.Types.ObjectId,
    ref: "DonationHistory",
  },

  /**
   * @field donorName
   * @type {String}
   * @description Donor name cho quick reference
   *
   * Donor identification:
   * - Quick lookup without population
   * - Privacy-compliant identification
   * - Emergency contact information
   */
  donorName: { type: String },

  /**
   * @field donorId
   * @type {ObjectId}
   * @ref User
   * @description Reference to donor user account
   *
   * Donor tracking:
   * - Full donor profile access
   * - Donation history correlation
   * - Contact information
   * - Medical history if needed
   */
  donorId: { type: Types.ObjectId, ref: "User" },

  /**
   * @field note
   * @type {String}
   * @description Additional notes về blood unit
   *
   * Notes can include:
   * - Special handling requirements
   * - Quality control observations
   * - Storage conditions
   * - Medical technician remarks
   */
  note: { type: String },

  /**
   * @field assignedToRequestId
   * @type {ObjectId}
   * @ref NeedRequest
   * @default null
   * @description Reference to assigned need request
   *
   * Assignment tracking:
   * - null: Available trong inventory
   * - ObjectId: Reserved cho specific request
   * - Prevents double assignment
   * - Tracks inventory allocation
   */
  assignedToRequestId: {
    type: mongoose.Schema.Types.ObjectId, // or whatever ID type you use
    ref: "NeedRequest",
    default: null,
  },
});

/**
 * Export BloodUnit model
 * @description Model này handles blood inventory management:
 *
 * Key Features:
 * - Individual blood unit tracking
 * - Multiple component type support
 * - Expiration date monitoring
 * - Donor traceability
 * - Request assignment system
 *
 * Inventory Management:
 * - FIFO (First In, First Out) expiration handling
 * - Automatic expiration alerts
 * - Component compatibility matching
 * - Assignment reservation system
 *
 * Blood Components:
 * 1. Whole Blood: Complete blood, 35-42 day shelf life
 * 2. Red Cells: Oxygen transport, 42 day shelf life
 * 3. Plasma: Clotting factors, 12 month frozen storage
 * 4. Platelets: Clotting support, 5 day shelf life (critical)
 *
 * Business Rules:
 * - Each donation creates one or more blood units
 * - Units must be assigned before expiration
 * - Traceability maintained to original donor
 * - Quality control notes preserved
 * - Assignment prevents inventory conflicts
 *
 * Integration Points:
 * - Donation completion workflow
 * - Need request fulfillment
 * - Inventory monitoring system
 * - Expiration alert system
 * - Quality control processes
 */
module.exports = mongoose.model("BloodUnit", bloodUnitSchema);
