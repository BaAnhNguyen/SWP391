/**
 * @fileoverview Donation History Model for Blood Donation Management System
 * @description Mongoose model để track completed donation records
 *
 * Chức năng chính:
 * - Store permanent records của completed donations
 * - Track health screening results và vital signs
 * - Record blood component details và volumes
 * - Calculate next eligible donation dates
 * - Maintain donation outcome status
 *
 * @requires mongoose - MongoDB object modeling
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const { Schema, model, Types } = require("mongoose");

/**
 * @schema healthCheckSchema
 * @description Embedded schema cho health screening data
 *
 * Health metrics collected before donation:
 * - Physical measurements (weight, height)
 * - Vital signs (blood pressure, heart rate, temperature)
 * - Blood tests (hemoglobin, alcohol level)
 * - Used để determine donation eligibility
 */
const healthCheckSchema = new Schema(
  {
    /**
     * @field weight
     * @type {Number}
     * @description Donor weight trong kilograms
     *
     * Weight requirements:
     * - Minimum 50kg cho whole blood donation
     * - Used để calculate donation volume
     * - Safety requirement cho donor health
     */
    weight: { type: Number },

    /**
     * @field height
     * @type {Number}
     * @description Donor height trong centimeters
     *
     * Height measurement:
     * - Used với weight để calculate BMI
     * - General health assessment
     * - Donation safety evaluation
     */
    height: { type: Number },

    /**
     * @field bloodPressure
     * @type {String}
     * @description Blood pressure reading (systolic/diastolic)
     *
     * Format: "120/80" (mmHg)
     * Validation: Must match pattern "XXX/XX" or "XX/XX"
     * Requirements: Within safe ranges cho donation
     */
    bloodPressure: {
      type: String,
      validate: {
        validator: (v) => !v || /^\d{2,3}\/\d{2,3}$/.test(v),
      },
    },

    /**
     * @field heartRate
     * @type {Number}
     * @description Heart rate trong beats per minute
     *
     * Heart rate assessment:
     * - Normal range: 60-100 bpm
     * - Must be stable cho safe donation
     * - Indicator của cardiovascular health
     */
    heartRate: { type: Number },

    /**
     * @field alcoholLevel
     * @type {Number}
     * @description Blood alcohol content level
     *
     * Alcohol screening:
     * - Must be 0 cho donation eligibility
     * - Safety requirement cho donor
     * - Affects blood quality
     */
    alcoholLevel: { type: Number },

    /**
     * @field temperature
     * @type {Number}
     * @description Body temperature trong Celsius
     *
     * Temperature check:
     * - Must be within normal range (36-37.5°C)
     * - Screens cho illness/infection
     * - Ensures donor health
     */
    temperature: { type: Number },

    /**
     * @field hemoglobin
     * @type {Number}
     * @description Hemoglobin level trong g/dL
     *
     * Hemoglobin requirements:
     * - Men: ≥13.0 g/dL
     * - Women: ≥12.5 g/dL
     * - Critical cho donation eligibility
     * - Prevents anemia trong donors
     */
    hemoglobin: { type: Number },
  },
  { _id: false } // Embedded document, no separate _id
);

/**
 * @schema donationHistorySchema
 * @description Main schema cho donation history records
 *
 * Permanent record của each completed donation:
 * - Links to donor user account
 * - Records donation details và outcomes
 * - Tracks health screening results
 * - Calculates future eligibility
 */
const donationHistorySchema = new Schema(
  {
    /**
     * @field userId
     * @type {ObjectId}
     * @ref User
     * @required true
     * @description Reference to donor user account
     *
     * Donor linkage:
     * - Connects donation to user profile
     * - Enables donation history tracking
     * - Supports eligibility calculations
     * - Required cho all donation records
     */
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * @field donationDate
     * @type {Date}
     * @required true
     * @description Date when donation was completed
     *
     * Date tracking:
     * - Actual completion date
     * - Used cho eligibility calculations
     * - Important cho medical history
     * - Regulatory compliance requirement
     */
    donationDate: {
      type: Date,
      required: true,
    },

    /**
     * @field bloodGroup
     * @type {String}
     * @enum ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "unknown"]
     * @required true
     * @description Donor's blood group confirmed at donation
     *
     * Blood type verification:
     * - Confirmed through testing
     * - May differ từ user profile (updates)
     * - Critical cho blood unit labeling
     * - Used cho compatibility matching
     */
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "unknown"],
      required: true,
    },

    /**
     * @field component
     * @type {String}
     * @enum ["WholeBlood", "Plasma", "Platelets", "RedCells", "unknown"]
     * @required true
     * @description Type of blood component donated
     *
     * Component types:
     * - WholeBlood: Standard donation (most common)
     * - Plasma: Plasma-only donation (apheresis)
     * - Platelets: Platelet donation (apheresis)
     * - RedCells: Red cell donation (apheresis)
     */
    component: {
      type: String,
      enum: ["WholeBlood", "Plasma", "Platelets", "RedCells", "unknown"],
      required: true,
    },

    /**
     * @field status
     * @type {String}
     * @enum ["Completed", "Failed"]
     * @required true
     * @default "Completed"
     * @description Final outcome của donation attempt
     *
     * Status outcomes:
     * - Completed: Successful donation, blood collected
     * - Failed: Donation attempted but not completed
     *   (health screening failed, adverse reaction, etc.)
     */
    status: {
      type: String,
      enum: ["Completed", "Failed"],
      required: true,
      default: "Completed",
    },

    /**
     * @field quantity
     * @type {Number}
     * @description Number of units collected
     *
     * Quantity tracking:
     * - Usually 1 unit per donation
     * - May vary based on donor size
     * - Used cho inventory management
     */
    quantity: { type: Number },

    /**
     * @field volume
     * @type {Number}
     * @description Volume collected trong milliliters
     *
     * Volume measurement:
     * - Standard whole blood: ~450mL
     * - Varies by component type
     * - Recorded cho medical records
     * - Used cho donor safety tracking
     */
    volume: { type: Number },

    /**
     * @field healthCheck
     * @type {healthCheckSchema}
     * @description Embedded health screening results
     *
     * Complete health assessment:
     * - Pre-donation vital signs
     * - Medical measurements
     * - Eligibility determination data
     * - Preserved cho medical history
     */
    healthCheck: healthCheckSchema,

    /**
     * @field nextEligibleDate
     * @type {Date}
     * @required false
     * @description Calculated next eligible donation date
     *
     * Eligibility calculation:
     * - Based on component type donated
     * - Whole blood: 56 days (8 weeks)
     * - Plasma: 28 days (4 weeks)
     * - Platelets: 7 days
     * - Not set cho failed donations
     */
    nextEligibleDate: {
      type: Date,
      required: false, // vì reject thì không cần
    },
  },
  { timestamps: true } // Automatically add createdAt và updatedAt
);

/**
 * Export DonationHistory model
 * @description Model này handles donation record keeping:
 *
 * Key Features:
 * - Permanent donation records
 * - Complete health screening data
 * - Donation outcome tracking
 * - Eligibility date calculations
 * - Medical history preservation
 *
 * Record Lifecycle:
 * 1. Created when donation registration completed successfully
 * 2. Health screening results recorded
 * 3. Donation outcome determined (Completed/Failed)
 * 4. Next eligible date calculated (if successful)
 * 5. Record preserved as permanent history
 *
 * Medical Information:
 * - Pre-donation health assessment
 * - Vital signs và physical measurements
 * - Blood test results (hemoglobin)
 * - Donation volume và component details
 * - Final outcome và any complications
 *
 * Business Rules:
 * - Records are permanent và cannot be deleted
 * - Only successful donations generate blood units
 * - Failed donations still count cho eligibility timing
 * - Health data must be complete cho successful donations
 * - Next eligible date helps prevent too-frequent donations
 *
 * Integration Points:
 * - Donation registration completion
 * - Blood unit creation (for successful donations)
 * - User eligibility checking
 * - Medical reporting và analytics
 * - Donor impact tracking
 */
module.exports = model("DonationHistory", donationHistorySchema);
