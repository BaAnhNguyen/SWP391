import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./Contact.css";

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log("Form submitted:", formData);
  };

  return (
    <div className="contact-page">      <section className="contact-hero">
        <div className="container">
          <div className="hero-content">
            <h1>{t('contact.title')}</h1>
            <h2>{t('contact.getInTouch')}</h2>
            <p>{t('contact.subtitle')}</p>
          </div>
        </div>
      </section>

      <section className="contact-info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">📞</div>
              <h3>{t('contact.phone')}</h3>
              <p>+1 (123) 456-7890</p>
              <p>{t('contact.hours')}</p>
            </div>
            <div className="info-card">
              <div className="info-icon">✉️</div>
              <h3>{t('contact.email')}</h3>
              <p>info@lifesource.com</p>              <p>support@lifesource.com</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>{t('contact.location')}</h3>
              <p>123 Blood Center Drive</p>
              <p>Medical District, City, 12345</p>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-form">
        <div className="container">
          <div className="form-container">
            <h2>{t('contact.sendMessage')}</h2>
            <p>{t('contact.responseTime')}</p>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder={t('contact.form.name')}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">                  <input
                    type="email"
                    name="email"
                    placeholder={t('contact.form.email')}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="subject"
                  placeholder={t('contact.form.subject')}
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  name="message"
                  placeholder={t('contact.form.message')}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                ></textarea>
              </div>
              <button type="submit" className="submit-btn">
                {t('contact.form.submit')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
