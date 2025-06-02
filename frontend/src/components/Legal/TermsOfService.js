import React from "react";
import { useTranslation } from "react-i18next";
import "./Legal.css";

function TermsOfService() {
  const { t } = useTranslation();

  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1>{t('legal.terms.title')}</h1>

        <section className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using LifeSource's blood donation services, you
            agree to these terms.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Eligibility</h2>
          <p>To donate blood, you must:</p>
          <ul>
            <li>Be at least 18 years old</li>
            <li>Meet our health requirements</li>
            <li>Provide accurate personal information</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. User Responsibilities</h2>
          <p>As a user, you agree to:</p>
          <ul>
            <li>Provide accurate and truthful information</li>
            <li>Follow donation center guidelines</li>
            <li>Keep your appointments or cancel in advance</li>
            <li>Inform us of any changes in your health status</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Service Modifications</h2>
          <p>
            We reserve the right to modify or discontinue any part of our
            service with notice to users.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Contact Us</h2>
          <p>
            If you have any questions about these terms, please contact us at:
          </p>
          <p>Email: support@lifesource.com</p>
          <p>Phone: (123) 456-7890</p>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService;
