/**
 * @fileoverview System Configuration Model for Blood Donation Management System
 * @description Mongoose model để manage system-wide configuration settings
 *
 * Chức năng chính:
 * - Store dynamic system configuration values
 * - Enable runtime configuration updates without code changes
 * - Support different data types cho configuration values
 * - Provide centralized configuration management
 * - Enable feature flags và business rule configuration
 *
 * @requires mongoose - MongoDB object modeling
 * @author SWP391 Blood Donation Team
 * @version 1.0.0
 */

const mongoose = require("mongoose");

/**
 * @schema systemConfigSchema
 * @description Schema cho system configuration key-value storage
 *
 * Flexible configuration system:
 * - Key-value pairs cho any configuration setting
 * - Mixed data types support (String, Number, Boolean, Object, Array)
 * - Unique keys ensure no duplicate configurations
 * - Runtime-modifiable settings without deployment
 */
const systemConfigSchema = new mongoose.Schema({
  /**
   * @field key
   * @type {String}
   * @required true
   * @unique true
   * @description Unique identifier cho configuration setting
   *
   * Configuration key naming conventions:
   * - Use dot notation cho hierarchical settings: "blood.minimum.A+"
   * - Descriptive names: "emergency.alert.enabled"
   * - Environment-specific: "email.smtp.production.host"
   * - Feature flags: "features.new.dashboard.enabled"
   *
   * Example keys:
   * - "blood.minimum.threshold.A+": Minimum A+ blood units
   * - "donation.interval.whole.blood": Days between whole blood donations
   * - "emergency.alert.enabled": Emergency alert system status
   * - "email.notifications.enabled": Email notification system
   * - "maintenance.mode": System maintenance status
   */
  key: { type: String, required: true, unique: true },

  /**
   * @field value
   * @type {Mixed}
   * @required true
   * @description Configuration value của any supported data type
   *
   * Supported value types:
   * - String: Text configurations, URLs, email addresses
   * - Number: Thresholds, intervals, limits
   * - Boolean: Feature flags, enabled/disabled states
   * - Object: Complex configuration structures
   * - Array: Lists of values, options, settings
   *
   * Example values:
   * - Number: 5 (minimum blood units)
   * - Boolean: true (feature enabled)
   * - String: "smtp.gmail.com" (email server)
   * - Object: { "A+": 10, "O-": 15 } (blood thresholds)
   * - Array: ["A+", "O+", "B+"] (supported blood types)
   */
  value: { type: mongoose.Schema.Types.Mixed, required: true },
});

/**
 * Export SystemConfig model
 * @description Model này handles system configuration:
 *
 * Key Features:
 * - Dynamic configuration management
 * - Multiple data type support
 * - Runtime configuration updates
 * - Centralized setting storage
 * - Feature flag support
 *
 * Common Configuration Categories:
 *
 * 1. Blood Management:
 *    - "blood.minimum.threshold.A+": 5
 *    - "blood.minimum.threshold.O-": 10
 *    - "blood.expiry.warning.days": 7
 *    - "blood.critical.alert.enabled": true
 *
 * 2. Donation Settings:
 *    - "donation.interval.whole.blood": 56
 *    - "donation.interval.plasma": 28
 *    - "donation.min.weight.kg": 50
 *    - "donation.max.age": 65
 *
 * 3. Notification Settings:
 *    - "email.notifications.enabled": true
 *    - "email.smtp.host": "smtp.gmail.com"
 *    - "sms.notifications.enabled": false
 *    - "push.notifications.enabled": true
 *
 * 4. Security Settings:
 *    - "jwt.token.expiry.hours": 24
 *    - "password.min.length": 8
 *    - "session.timeout.minutes": 30
 *    - "login.max.attempts": 5
 *
 * 5. Feature Flags:
 *    - "features.emergency.alert": true
 *    - "features.donor.rewards": false
 *    - "features.mobile.app": true
 *    - "features.social.sharing": true
 *
 * 6. UI Customization:
 *    - "ui.theme.default": "light"
 *    - "ui.logo.url": "/assets/logo.png"
 *    - "ui.footer.text": "Blood Bank © 2024"
 *    - "ui.maintenance.message": "System under maintenance"
 *
 * Business Rules:
 * - Keys must be unique across system
 * - Values can be any JSON-serializable type
 * - Changes take effect immediately
 * - Configuration should be validated before use
 * - Historical changes may be logged
 *
 * Usage Patterns:
 * - Load configurations at application startup
 * - Cache frequently accessed values
 * - Reload configurations without restart
 * - Admin interface cho configuration management
 * - Environment-specific configuration overrides
 *
 * Integration Points:
 * - Application initialization
 * - Admin configuration interface
 * - Feature flag systems
 * - Business rule engines
 * - Monitoring và alerting systems
 */
module.exports = mongoose.model("SystemConfig", systemConfigSchema);
