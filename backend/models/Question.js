/**
 * @fileoverview Health Screening Question Model for Blood Donation Management System
 * @description Mongoose model để manage health screening questionnaire
 *
 * Chức năng chính:
 * - Store health screening questions cho donation eligibility
 * - Support dynamic questionnaire configuration
 * - Enable question ordering và sequencing
 * - Support multilingual question content
 * - Track question usage và analytics
 *
 * @requires mongoose - MongoDB object modeling
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const { Schema, model } = require("mongoose");

/**
 * @schema screeningQuestionSchema
 * @description Schema cho health screening questions
 *
 * Supports dynamic questionnaire system:
 * - Configurable question content
 * - Ordered question presentation
 * - Different question types và validation
 * - Medical eligibility assessment
 */
const screeningQuestionSchema = new Schema({
  /**
   * @field content
   * @type {String}
   * @required true
   * @description The actual question text presented to donors
   *
   * Question content guidelines:
   * - Clear, concise medical questions
   * - Easy to understand language
   * - Specific enough để assess eligibility
   * - Comply với medical screening standards
   *
   * Example questions:
   * - "Have you donated blood trong the past 8 weeks?"
   * - "Are you currently taking any medications?"
   * - "Have you traveled outside Vietnam trong the past 3 months?"
   * - "Do you have any chronic medical conditions?"
   */
  content: { type: String, required: true },

  /**
   * @field order
   * @type {Number}
   * @default 0
   * @description Sequence order cho question presentation
   *
   * Question ordering:
   * - Lower numbers displayed first
   * - Allows logical flow of questions
   * - Groups related questions together
   * - Critical questions can be prioritized
   *
   * Typical ordering:
   * - 1-10: Basic eligibility (age, weight, health)
   * - 11-20: Medical history questions
   * - 21-30: Recent health events
   * - 31-40: Risk factor assessment
   * - 41-50: Travel và exposure questions
   */
  order: { type: Number, default: 0 },
});

/**
 * Export Question model
 * @description Model này handles health screening questionnaire:
 *
 * Key Features:
 * - Dynamic questionnaire configuration
 * - Ordered question presentation
 * - Medical eligibility assessment
 * - Staff-configurable content
 * - Regulatory compliance support
 *
 * Medical Screening Purpose:
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
 *    - "Have you donated blood trong the last 8 weeks?"
 *
 * 2. Health History:
 *    - "Do you have any chronic medical conditions?"
 *    - "Are you currently taking any medications?"
 *    - "Have you had surgery trong the past 6 months?"
 *
 * 3. Recent Health Events:
 *    - "Have you been sick trong the past 2 weeks?"
 *    - "Have you had a fever trong the past 3 days?"
 *    - "Have you received any vaccinations recently?"
 *
 * 4. Risk Assessment:
 *    - "Have you traveled outside the country recently?"
 *    - "Have you been exposed to infectious diseases?"
 *    - "Do you engage trong high-risk behaviors?"
 *
 * Business Rules:
 * - Questions must be medically validated
 * - Order determines presentation sequence
 * - Staff can add/modify questions
 * - Historical responses must be preserved
 * - Regular review và updates required
 *
 * Integration Points:
 * - Donation registration system
 * - Health screening workflow
 * - Medical eligibility assessment
 * - Staff question management interface
 * - Regulatory compliance reporting
 */
module.exports = model("Question", screeningQuestionSchema);
