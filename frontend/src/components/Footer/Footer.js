import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section about">
          <h3>About LifeSource</h3>
          <p>We are dedicated to ensuring a safe and adequate blood supply for our community. Your donation can save up to 3 lives!</p>
        </div>
        
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/donation-process">Donation Process</Link></li>
            <li><Link to="/upcoming-drives">Upcoming Drives</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p><i className="icon">📍</i> 123 Nguyen Kiem, P.5, Go Vap</p>
          <p><i className="icon">📞</i> 0949730930</p>
          <p><i className="icon">✉️</i> baanhnguyenn@gmail.com</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">FB</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">TW</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">IG</a>
          </div>
        </div>
      </div>
      
      <div className="copyright">
        <p>&copy; {new Date().getFullYear()} SWP391</p>
      </div>
    </footer>
  );
}

export default Footer;
