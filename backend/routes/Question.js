/**
 * @fileoverview Health Screening Question Routes for Blood Donation Management System
 * @description Routes xử lý health screening questionnaire management
 *
 * Chức năng chính:
 * - Health screening question management
 * - Dynamic questionnaire configuration
 * - Staff question CRUD operations
 * - Donation eligibility assessment questions
 *
 * @requires express.Router - Express router instance
 * @requires ../controllers/QuestionController - Question management controllers
 * @requires ../middlewares/auth - Authentication và role-based access control
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const router = require("express").Router();
const ctrl = require("../controllers/QuestionController");
const { protect, restrictTo } = require("../middlewares/auth");

/**
 * @middleware protect
 * @description All question routes require authentication
 *
 * Apply JWT authentication:
 * - Verify valid token trong Authorization header
 * - Load authenticated user data vào req.user
 * - Ensure users are logged in để access health questions
 * - Block banned users từ health screening system
 */
router.use(protect);

/**
 * @section Question Access & Listing
 * @description Routes cho accessing health screening questions
 */

/**
 * @route GET /api/question/
 * @access Private (All authenticated users)
 * @description Get all active health screening questions
 *
 * Health screening questionnaire:
 * - Return all active questions cho donation screening
 * - Include question text, type (yes/no, multiple choice, text)
 * - Show question order/sequence
 * - Include validation rules và scoring criteria
 * - Support different languages nếu implemented
 * - Used by donation registration form
 *
 * Question Categories:
 * - Medical history (chronic conditions, medications)
 * - Recent health events (illness, surgery, travel)
 * - Lifestyle factors (diet, exercise, habits)
 * - Risk behaviors (exposure to infectious diseases)
 * - Physical eligibility (weight, age, blood pressure)
 *
 * Response Types:
 * - Boolean (Yes/No questions)
 * - Multiple choice (select from options)
 * - Numeric input (weight, age, blood pressure)
 * - Text input (medication names, travel destinations)
 */
router.get("/", ctrl.list);

/**
 * @section Staff Question Management
 * @description Admin routes cho questionnaire configuration (Staff only)
 */

/**
 * @route POST /api/question/
 * @access Private (Staff only)
 * @description Create new health screening question
 *
 * Question creation process:
 * - Add new question đến screening questionnaire
 * - Define question text trong multiple languages
 * - Set question type (boolean, choice, numeric, text)
 * - Configure validation rules và acceptable answers
 * - Set scoring criteria cho eligibility assessment
 * - Define follow-up questions based on answers
 * - Set question order trong questionnaire sequence
 *
 * Question Configuration:
 * - questionText: The question to display
 * - questionType: boolean|choice|numeric|text
 * - isRequired: whether question must be answered
 * - validationRules: min/max values, format requirements
 * - scoringWeight: impact on eligibility assessment
 * - followUpQuestions: conditional questions based on answer
 * - isActive: whether question is currently used
 */
router.post("/", restrictTo("Staff"), ctrl.create);

/**
 * @route PUT /api/question/:id
 * @access Private (Staff only)
 * @description Update existing health screening question
 *
 * Question modification:
 * - Update question text hoặc translation
 * - Modify question type hoặc validation rules
 * - Change scoring criteria hoặc eligibility impact
 * - Adjust question order trong sequence
 * - Enable/disable questions based on medical guidelines
 * - Update follow-up question logic
 * - Maintain version history cho compliance
 *
 * Update Considerations:
 * - Changes affect future donation registrations
 * - Maintain compatibility với existing responses
 * - Update medical staff training materials
 * - Notify system administrators của changes
 */
router.put("/:id", restrictTo("Staff"), ctrl.update);

/**
 * @route DELETE /api/question/:id
 * @access Private (Staff only)
 * @description Remove health screening question
 *
 * Question deletion process:
 * - Soft delete để preserve historical data
 * - Mark question as inactive rather than physical deletion
 * - Maintain questionnaire responses từ past donations
 * - Update questionnaire sequence numbers
 * - Archive question cho compliance records
 * - Cannot delete questions with existing responses
 *
 * Deletion Rules:
 * - Soft delete only (preserve audit trail)
 * - Cannot delete if question has responses
 * - Must maintain questionnaire integrity
 * - Requires supervisor approval cho critical questions
 * - Update training materials after deletion
 */
router.delete("/:id", restrictTo("Staff"), ctrl.delete);

/**
 * Export question router
 * @description Router này handle health screening questionnaire:
 *
 * Health Screening Purpose:
 * - Assess donor eligibility before blood donation
 * - Identify health risks that could affect donation safety
 * - Protect both donor và recipient safety
 * - Comply với blood bank regulatory requirements
 * - Maintain blood supply quality standards
 *
 * Question Categories & Examples:
 *
 * 1. Basic Eligibility:
 *    - "Are you between 18-65 years old?"
 *    - "Do you weigh at least 50kg?"
 *    - "Have you donated blood in the last 8 weeks?"
 *
 * 2. Health History:
 *    - "Do you have any chronic medical conditions?"
 *    - "Are you currently taking any medications?"
 *    - "Have you had surgery in the past 6 months?"
 *
 * 3. Recent Health Events:
 *    - "Have you been sick trong the past 2 weeks?"
 *    - "Have you had a fever trong the past 3 days?"
 *    - "Have you received any vaccinations recently?"
 *
 * 4. Risk Assessment:
 *    - "Have you traveled outside the country recently?"
 *    - "Have you been exposed to infectious diseases?"
 *    - "Do you engage in high-risk behaviors?"
 *
 * 5. Physical Assessment:
 *    - "What is your current weight?"
 *    - "Have you had your blood pressure checked?"
 *    - "Do you feel well today?"
 *
 * Questionnaire Logic:
 * - Sequential presentation của questions
 * - Conditional questions based on previous answers
 * - Automatic eligibility scoring
 * - Instant feedback on disqualifying answers
 * - Medical staff override capabilities
 *
 * Permission Matrix:
 * - All Users: View và answer questions during registration
 * - Staff: Full CRUD operations, questionnaire configuration
 * - Admin: All staff permissions plus system analytics
 *
 * Business Rules:
 * - Questions must comply với medical guidelines
 * - Answers affect donation eligibility immediately
 * - Historical responses must be preserved
 * - Changes require medical staff approval
 * - Regular review và updates based on health regulations
 *
 * Integration Points:
 * - Donation registration system
 * - Health screening workflow
 * - Medical eligibility assessment
 * - Regulatory compliance reporting
 * - Staff training materials
 */
module.exports = router;
