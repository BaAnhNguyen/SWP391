/**
 * @fileoverview Donation History Routes for Blood Donation Management System
 * @description Routes xử lý donation history tracking và donor records
 *
 * Chức năng chính:
 * - Individual donation record retrieval
 * - Donor history tracking và verification
 * - Medical record access với proper authorization
 * - Donation impact tracking
 *
 * @requires express.Router - Express router instance
 * @requires ../middlewares/auth - Authentication và role-based access control
 * @requires ../controllers/donationHistoryController - Donation history controllers
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const router = require("express").Router();
const { protect, restrictTo } = require("../middlewares/auth");
const ctrl = require("../controllers/donationHistoryController");

/**
 * @middleware protect
 * @description All donation history routes require authentication
 *
 * Apply JWT authentication:
 * - Verify valid token trong Authorization header
 * - Load authenticated user data vào req.user
 * - Ensure proper access to medical records
 * - Block unauthorized access to sensitive donation data
 */
router.use(protect);

/**
 * @section Donation History Access
 * @description Routes cho accessing individual donation records
 */

/**
 * @route GET /api/donation-history/:id
 * @access Private (Member/Staff only)
 * @description Get specific donation history record
 *
 * Donation record retrieval:
 * - Member: Can only access own donation records
 * - Staff: Can access any donation record cho medical purposes
 * - Include complete donation details và timeline
 * - Show health screening results và eligibility status
 * - Display blood units created từ donation
 * - Track donation outcome và any complications
 *
 * Record Information:
 * - Donation date, time, và location
 * - Pre-donation health screening results
 * - Blood pressure, weight, hemoglobin levels
 * - Volume collected và processing status
 * - Post-donation instructions và follow-up
 * - Any adverse reactions hoặc complications
 * - Blood units created và their current status
 *
 * Privacy Controls:
 * - Members can only view their own records
 * - Staff access logged cho audit purposes
 * - Sensitive medical information protected
 * - Compliance với HIPAA-style privacy rules
 *
 * Medical Information Included:
 * - Health questionnaire responses
 * - Vital signs at time của donation
 * - Medical staff notes và observations
 * - Quality control test results
 * - Donation eligibility assessment
 * - Next eligible donation date calculation
 *
 * @param {string} id - Donation history record ID
 */
router.get("/:id", restrictTo("Member", "Staff"), ctrl.getOne);

/**
 * Export donation history router
 * @description Router này handle donation history access:
 *
 * Donation History Purpose:
 * - Track individual donation records cho medical continuity
 * - Provide donors với their donation history
 * - Enable staff to review donor medical records
 * - Support eligibility determination cho future donations
 * - Maintain regulatory compliance records
 *
 * Record Lifecycle:
 * 1. Created when donation registration completed successfully
 * 2. Updated với health screening results
 * 3. Finalized với blood collection details
 * 4. Enhanced với blood unit tracking information
 * 5. Archived as permanent donor record
 *
 * Data Categories:
 *
 * 1. Donor Information:
 *    - Donor demographics at time của donation
 *    - Blood group và Rh factor
 *    - Contact information used
 *    - Emergency contact details
 *
 * 2. Pre-Donation Assessment:
 *    - Health questionnaire responses
 *    - Vital signs (BP, pulse, temperature)
 *    - Hemoglobin level testing
 *    - Physical examination results
 *    - Eligibility determination
 *
 * 3. Donation Process:
 *    - Start và end times
 *    - Volume collected
 *    - Staff members involved
 *    - Equipment used (lot numbers)
 *    - Any complications hoặc issues
 *
 * 4. Post-Donation:
 *    - Recovery period monitoring
 *    - Instructions given to donor
 *    - Follow-up recommendations
 *    - Next eligible donation date
 *    - Thank you communications sent
 *
 * 5. Blood Processing:
 *    - Blood units created
 *    - Testing results (blood type confirmation, disease screening)
 *    - Processing outcomes
 *    - Storage locations
 *    - Usage tracking (which patients received blood)
 *
 * Permission Matrix:
 * - Member: View own donation history records only
 * - Staff: View any donation record với medical justification
 * - Admin: Full access to all records plus analytics
 *
 * Privacy & Security:
 * - Medical record privacy protection
 * - Access logging cho all staff views
 * - Data encryption trong transit và at rest
 * - Audit trail của all record access
 * - Compliance với healthcare privacy regulations
 *
 * Business Rules:
 * - Records are permanent và cannot be deleted
 * - Only authorized medical staff can modify records
 * - Donor consent required cho research use
 * - Historical accuracy must be maintained
 * - Regular backup và disaster recovery procedures
 *
 * Integration Points:
 * - Donation registration system
 * - Blood unit inventory system
 * - Medical screening workflow
 * - Donor notification system
 * - Regulatory reporting system
 * - Analytics và reporting dashboard
 *
 * Future Enhancements:
 * - Bulk history export cho donors
 * - Medical timeline visualization
 * - Donation milestone tracking
 * - Impact reports (lives saved, blood used)
 * - Integration với health apps
 */
module.exports = router;
