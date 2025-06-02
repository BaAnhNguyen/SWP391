import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BenefitsCarousel from '../BenefitsCarousel/BenefitsCarousel';
import './HomePage.css';

function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1>{t('home.hero.title')}</h1>
            <h2>{t('home.hero.subtitle2')}</h2>
            <p>{t('home.hero.subtitle')}</p>
            <div className="hero-buttons">
              <Link 
                to="/donate" 
                className="btn btn-primary"
                onClick={(e) => {
                  if (!localStorage.getItem('token')) {
                    e.preventDefault();
                    window.location.href = '/login';
                  }
                }}
              >
                {t('home.hero.donateButton')}
              </Link>
              <Link to="/donation-process" className="btn btn-outline">{t('home.hero.learnMore')}</Link>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="https://img.freepik.com/free-photo/close-up-hand-holding-blood-drop_23-2148287765.jpg" 
              alt="Blood Donation" 
            />
          </div>
        </div>
      </section>      {/* Benefits Carousel Section */}
      <BenefitsCarousel />

      {/* Blood Types Section */}
      <section className="blood-types">
        <div className="container">
          <h2>{t('bloodTypes.title')}</h2>
          <p className="section-description">
            {t('bloodTypes.description')}
          </p>
          
          <div className="blood-types-grid">
            <div className="blood-type-card">              <div className="blood-type">A+</div>
              <div className="compatibility">
                <p><strong>{t('bloodTypes.canDonateTo')}</strong> {t('bloodTypes.aPlus.donateTo')}</p>
                <p><strong>{t('bloodTypes.canReceiveFrom')}</strong> {t('bloodTypes.aPlus.receiveFrom')}</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">A-</div>
              <div className="compatibility">
                <p><strong>{t('bloodTypes.canDonateTo')}</strong> {t('bloodTypes.aMinus.donateTo')}</p>
                <p><strong>{t('bloodTypes.canReceiveFrom')}</strong> {t('bloodTypes.aMinus.receiveFrom')}</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">B+</div>
              <div className="compatibility">
                <p><strong>{t('bloodTypes.canDonateTo')}</strong> {t('bloodTypes.bPlus.donateTo')}</p>
                <p><strong>{t('bloodTypes.canReceiveFrom')}</strong> {t('bloodTypes.bPlus.receiveFrom')}</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">B-</div>
              <div className="compatibility">
                <p><strong>{t('bloodTypes.canDonateTo')}</strong> {t('bloodTypes.bMinus.donateTo')}</p>
                <p><strong>{t('bloodTypes.canReceiveFrom')}</strong> {t('bloodTypes.bMinus.receiveFrom')}</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">AB+</div>
              <div className="compatibility">
                <p><strong>{t('bloodTypes.canDonateTo')}</strong> {t('bloodTypes.abPlus.donateTo')}</p>
                <p><strong>{t('bloodTypes.canReceiveFrom')}</strong> {t('bloodTypes.abPlus.receiveFrom')}</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">AB-</div>
              <div className="compatibility">
                <p><strong>{t('bloodTypes.canDonateTo')}</strong> {t('bloodTypes.abMinus.donateTo')}</p>
                <p><strong>{t('bloodTypes.canReceiveFrom')}</strong> {t('bloodTypes.abMinus.receiveFrom')}</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">O+</div>
              <div className="compatibility">
                <p><strong>{t('bloodTypes.canDonateTo')}</strong> {t('bloodTypes.oPlus.donateTo')}</p>
                <p><strong>{t('bloodTypes.canReceiveFrom')}</strong> {t('bloodTypes.oPlus.receiveFrom')}</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">O-</div>
              <div className="compatibility">
                <p><strong>{t('bloodTypes.canDonateTo')}</strong> {t('bloodTypes.oMinus.donateTo')}</p>
                <p><strong>{t('bloodTypes.canReceiveFrom')}</strong> {t('bloodTypes.oMinus.receiveFrom')}</p>
                <p className="special-note">{t('bloodTypes.universalDonor')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Donation Process Section */}
      <section className="donation-process">
        <div className="container">
          <h2>{t('donationProcess.title')}</h2>
          <p className="section-description">
            {t('donationProcess.description')}
          </p>
          
          <div className="process-steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>{t('donationProcess.step1.title')}</h3>
              <p>{t('donationProcess.step1.description')}</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>{t('donationProcess.step2.title')}</h3>
              <p>{t('donationProcess.step2.description')}</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>{t('donationProcess.step3.title')}</h3>
              <p>{t('donationProcess.step3.description')}</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>{t('donationProcess.step4.title')}</h3>
              <p>{t('donationProcess.step4.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <h2>{t('testimonials.title')}</h2>
          <div className="testimonials-container">
            <div className="testimonial">
              <div className="quote">{t('testimonials.quote1')}</div>
              <div className="author">{t('testimonials.author1')}</div>
            </div>
            <div className="testimonial">
              <div className="quote">{t('testimonials.quote2')}</div>
              <div className="author">{t('testimonials.author2')}</div>
            </div>
            <div className="testimonial">
              <div className="quote">{t('testimonials.quote3')}</div>
              <div className="author">{t('testimonials.author3')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container cta-container">
          <h2>{t('cta.title')}</h2>
          <p>{t('cta.description')}</p>
          <Link to="/donate" className="btn btn-primary">{t('cta.button')}</Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
