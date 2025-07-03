import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section about">
          <h3>{t('footer.about')}</h3>
          <p>{t('footer.aboutText')}</p>
        </div>
        
        <div className="footer-section links">
          <h3>{t('footer.quickLinks')}</h3>
          <ul>
            <li><Link to="/">{t('nav.home')}</Link></li>
            {/* <li><Link to="/about">{t('nav.about')}</Link></li>
            <li><Link to="/donation-process">{t('nav.donationProcess')}</Link></li>
            <li><Link to="/upcoming-drives">{t('nav.upcomingDrives')}</Link></li> */}
            <li><Link to="/contact">{t('nav.contact')}</Link></li>
          </ul>
        </div>
        
        <div className="footer-section contact">
          <h3>{t('footer.contact')}</h3>
          <p>{t('footer.address')}</p>
          <p>{t('footer.phone')}</p>
          <p>{t('footer.email')}</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">FB</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">TW</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">IG</a>
          </div>
        </div>
      </div>
      
      <div className="copyright">
        <p>{t('footer.rights')}</p>
      </div>
    </footer>
  );
}

export default Footer;
