import React from "react";
import { useTranslation } from "react-i18next";
import "./Legal.css";

function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1>{t('legal.privacy.title')}</h1>

        <section className="legal-section">
          <h2>1. Information We Collect</h2>
          <p>We collect the following information:</p>
          <ul>
            <li>Name and contact information</li>
            <li>Date of birth</li>
            <li>Basic health information</li>
            <li>Blood type</li>
            <li>Donation history</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>2. How We Use Your Information</h2>
          <p>Your information is used to:</p>
          <ul>
            <li>Manage your donations</li>
            <li>Contact you about donation opportunities</li>
            <li>Ensure safe blood donation practices</li>
            <li>Improve our services</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Information Security</h2>
          <p>We protect your information by:</p>
          <ul>
            <li>Using secure servers</li>
            <li>Limiting access to authorized personnel</li>
            <li>Regular security updates</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Update your information</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of communications</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Contact Us</h2>
          <p>For privacy concerns, contact us at:</p>
          <p>Email: privacy@lifesource.com</p>
          <p>Phone: (123) 456-7890</p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
