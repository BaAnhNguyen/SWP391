import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <h1>
              <span className="logo-icon">❤</span> 
              LifeSource
            </h1>
          </Link>
        </div>
        
        <div className="mobile-menu-icon" onClick={toggleMenu}>
          <div className={menuOpen ? "hamburger open" : "hamburger"}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <nav className={menuOpen ? "nav-menu active" : "nav-menu"}>
          <ul>
            <li><Link to="/" className="nav-link">Home</Link></li>
            <li><Link to="/about" className="nav-link">About Us</Link></li>
            <li><Link to="/donation-process" className="nav-link">Donation Process</Link></li>
            <li><Link to="/upcoming-drives" className="nav-link">Upcoming Drives</Link></li>
            <li><Link to="/contact" className="nav-link">Contact</Link></li>
            <li><Link to="/donate" className="nav-link btn btn-primary">Donate Now</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
